# SILAKAP Phase 3 - cPanel Cron & Production Hardening

Gunakan endpoint cron dengan header `x-cron-secret`. Semua perintah di bawah diasumsikan API berjalan di `https://domain-anda.go.id/api/v1`.

## Environment Production

```env
NODE_ENV="production"
UPLOAD_DIR="/home/username/uploads"
BACKUP_DIR="/home/username/backups"
BACKUP_RETENTION_FILES=7
CRON_SECRET="random-minimal-64-karakter"
CORS_ORIGINS="https://domain-anda.go.id,https://www.domain-anda.go.id"
SENTRY_DSN="https://..."
```

Pastikan folder dibuat di cPanel File Manager atau SSH:

```bash
mkdir -p /home/username/uploads /home/username/backups
chmod 700 /home/username/uploads /home/username/backups
```

## Cron Jobs

SLA checker setiap 30 menit:

```bash
*/30 * * * * curl -fsS -X POST -H "x-cron-secret: CRON_SECRET_ANDA" https://domain-anda.go.id/api/v1/jobs/sla-check >/dev/null 2>&1
```

Laporan harian pukul 16:00:

```bash
0 16 * * * curl -fsS -X POST -H "x-cron-secret: CRON_SECRET_ANDA" https://domain-anda.go.id/api/v1/jobs/laporan-harian >/dev/null 2>&1
```

Laporan bulanan setiap tanggal 1 pukul 07:00:

```bash
0 7 1 * * curl -fsS -X POST -H "x-cron-secret: CRON_SECRET_ANDA" https://domain-anda.go.id/api/v1/jobs/laporan-bulanan >/dev/null 2>&1
```

Backup database harian pukul 23:30:

```bash
30 23 * * * curl -fsS -X POST -H "x-cron-secret: CRON_SECRET_ANDA" https://domain-anda.go.id/api/v1/jobs/db-backup >/dev/null 2>&1
```

## Endpoint Audit Manual

Audit ENV:

```bash
curl -fsS -H "x-cron-secret: CRON_SECRET_ANDA" https://domain-anda.go.id/api/v1/jobs/env-audit
```

Trigger backup manual:

```bash
curl -fsS -X POST -H "x-cron-secret: CRON_SECRET_ANDA" https://domain-anda.go.id/api/v1/jobs/db-backup
```

List backup:

```bash
curl -fsS -H "x-cron-secret: CRON_SECRET_ANDA" https://domain-anda.go.id/api/v1/jobs/db-backup
```

Retensi otomatis menjaga 7 file terbaru sesuai `BACKUP_RETENTION_FILES`.
