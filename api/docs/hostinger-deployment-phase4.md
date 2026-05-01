# SILAKAP Phase 4 - Hostinger Shared Hosting Deployment

Runbook ini memakai asumsi:

- Domain: `https://domain-anda.go.id`
- User cPanel: `username`
- API lokal: `127.0.0.1:3100`
- Web lokal: `127.0.0.1:3001`
- API public prefix: `/api/v1`

Ganti `username`, `domain-anda.go.id`, dan secret sebelum deploy.

## 1. Checklist Build/Test/Migrate/Seed

Local atau CI:

```bash
cd api
npm ci
npm run typecheck
npm test
npx prisma validate
npm run build
```

```bash
cd web
npm ci
npx tsc --noEmit
npm test
npm run build
```

Production server:

```bash
cd /home/username/api
npm ci --omit=dev
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
```

Jika seed sudah pernah dijalankan, tetap aman karena seed utama memakai `upsert`.

## 2. Struktur Folder

Target final:

```text
/home/username/
  public_html/
    .htaccess
  api/
    dist/
    prisma/
    node_modules/
    package.json
    package-lock.json
    ecosystem.config.js
    .env
  web/
    .next/
    public/
    node_modules/
    package.json
    package-lock.json
    next.config.ts
    .env.production
  uploads/
  backups/
  logs/
  ecosystem.config.js
```

Folder private:

```bash
mkdir -p /home/username/api /home/username/web /home/username/uploads /home/username/backups /home/username/logs
chmod 700 /home/username/uploads /home/username/backups /home/username/logs
```

Jangan taruh `.env`, source TypeScript, backup SQL, atau uploads private di `public_html`.

## 3. ENV Production

`/home/username/api/.env`:

```env
NODE_ENV="production"
PORT=3100
API_PREFIX="/api/v1"
APP_URL="https://domain-anda.go.id"
DATABASE_URL="mysql://DB_USER:DB_PASS@localhost:3306/DB_NAME"
JWT_SECRET="random-minimal-64-karakter"
JWT_REFRESH_SECRET="random-minimal-64-karakter-lain"
BCRYPT_ROUNDS=10
CORS_ORIGINS="https://domain-anda.go.id,https://www.domain-anda.go.id"
UPLOAD_DIR="/home/username/uploads"
BACKUP_DIR="/home/username/backups"
BACKUP_RETENTION_FILES=7
MYSQLDUMP_BIN="mysqldump"
CRON_SECRET="random-minimal-64-karakter-khusus-cron"
SMTP_HOST="mail.domain-anda.go.id"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="noreply@domain-anda.go.id"
SMTP_PASS="password-email"
SMTP_FROM="SILAKAP <noreply@domain-anda.go.id>"
SENTRY_DSN=""
```

`/home/username/web/.env.production`:

```env
NODE_ENV="production"
NEXT_PUBLIC_API_URL="https://domain-anda.go.id/api/v1"
NEXT_PUBLIC_SENTRY_DSN=""
```

Audit ENV setelah API menyala:

```bash
curl -fsS -H "x-cron-secret: CRON_SECRET_ANDA" https://domain-anda.go.id/api/v1/jobs/env-audit
```

## 4. Proxy .htaccess

Copy `deploy/public_html.htaccess` ke:

```text
/home/username/public_html/.htaccess
```

Isi penting:

```apache
RewriteEngine On

RewriteCond %{HTTPS} !=on
RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

RewriteCond %{REQUEST_URI} ^/api/
RewriteRule ^api/(.*)$ http://127.0.0.1:3100/api/$1 [P,L,QSA]

RewriteCond %{REQUEST_URI} ^/_next/
RewriteRule ^(.*)$ http://127.0.0.1:3001/$1 [P,L,QSA]

RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://127.0.0.1:3001/$1 [P,L,QSA]
```

Catatan:

- Pastikan Apache `mod_proxy` tersedia.
- Jika Hostinger Node.js manager memberi port berbeda, ubah `3100` dan `3001`.
- `.htaccess` di `public_html` berlaku ke folder turunannya, jadi jangan taruh app private di bawah `public_html`.

## 5. PM2 API + Web

Copy `deploy/ecosystem.config.js` ke:

```text
/home/username/ecosystem.config.js
```

Edit:

- `cwd`
- domain `NEXT_PUBLIC_API_URL`
- log path
- port jika perlu

Start:

```bash
cd /home/username
pm2 start ecosystem.config.js
pm2 save
pm2 status
```

Auto-start opsi shared hosting:

```bash
pm2 resurrect
```

Jika `pm2 startup` tidak diizinkan di shared hosting, tambah cron cPanel:

```bash
@reboot /home/username/.npm-global/bin/pm2 resurrect >/dev/null 2>&1
```

Sesuaikan path PM2:

```bash
which pm2
```

Restart deploy:

```bash
cd /home/username/api
npm ci --omit=dev
npx prisma generate
npx prisma migrate deploy
npm run build

cd /home/username/web
npm ci --omit=dev
npm run build

cd /home/username
pm2 reload ecosystem.config.js --update-env
pm2 save
```

## 6. SSL AutoSSL + Force HTTPS

Di cPanel:

1. Aktifkan AutoSSL untuk domain.
2. Tunggu sertifikat issued.
3. Pastikan `https://domain-anda.go.id` valid.
4. Baru aktifkan force HTTPS via `.htaccess` atau Domains → Force HTTPS Redirect.

Smoke:

```bash
curl -I http://domain-anda.go.id
curl -I https://domain-anda.go.id
```

Expected:

- HTTP memberi `301` ke HTTPS.
- HTTPS memberi `200` atau `307/308` internal Next, bukan certificate error.

## 7. Cron cPanel

Gunakan dari `api/docs/cpanel-cron-phase3.md`:

- SLA setiap 30 menit
- laporan harian 16:00
- laporan bulanan tanggal 1 pukul 07:00
- backup harian 23:30

Smoke manual:

```bash
curl -fsS -X POST -H "x-cron-secret: CRON_SECRET_ANDA" https://domain-anda.go.id/api/v1/jobs/sla-check
curl -fsS -X POST -H "x-cron-secret: CRON_SECRET_ANDA" https://domain-anda.go.id/api/v1/jobs/db-backup
curl -fsS -H "x-cron-secret: CRON_SECRET_ANDA" https://domain-anda.go.id/api/v1/jobs/db-backup
```

## 8. Audit Phase 4 Smoke Test

Domain & frontend:

```bash
curl -I https://domain-anda.go.id
curl -I https://domain-anda.go.id/_next/static/
```

API:

```bash
curl -fsS https://domain-anda.go.id/health
curl -fsS https://domain-anda.go.id/api/v1/auth/me
```

`/auth/me` harus `401` tanpa token. Itu benar.

Proxy:

```bash
curl -I https://domain-anda.go.id/api/v1/jobs/env-audit
```

Expected `401` tanpa `x-cron-secret`.

PM2:

```bash
pm2 status
pm2 logs silakap-api --lines 50
pm2 logs silakap-web --lines 50
```

Database:

```bash
cd /home/username/api
npx prisma migrate status
```

Backup:

```bash
ls -lh /home/username/backups | tail
```

Security:

```bash
curl -I https://domain-anda.go.id/.env
curl -I https://domain-anda.go.id/package.json
```

Expected: `403` or not found.

## 9. Rollback Cepat

Simpan release lama:

```text
/home/username/releases/api-YYYYMMDDHHmm
/home/username/releases/web-YYYYMMDDHHmm
```

Rollback:

```bash
pm2 stop silakap-api silakap-web
rsync -a --delete /home/username/releases/api-OLD/ /home/username/api/
rsync -a --delete /home/username/releases/web-OLD/ /home/username/web/
pm2 start /home/username/ecosystem.config.js
pm2 save
```

Jika migration sudah destructive, restore DB dari `/home/username/backups`.
