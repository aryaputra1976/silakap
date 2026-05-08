# SILAKAP Staging/UAT Checklist

## Environment
- Backend env file: copy `api/.env.example` to `api/.env` on staging.
- Frontend env file: copy `web/.env.example` to `web/.env.local` or set equivalent process env.
- Use placeholder-free values for `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CRON_SECRET`, `UPLOAD_DIR`, `BACKUP_DIR`, `CORS_ORIGINS`, `APP_URL`, and `NEXT_PUBLIC_API_URL`.
- Generate secrets with at least 64 random characters, for example:
  `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
- `UPLOAD_DIR` and `BACKUP_DIR` must be absolute paths in production/staging and outside public web roots.
- Configure SMTP before testing registration, reset password, or email notification flows.

## Database Deployment
- From `api/`, run:
  - `npx prisma generate`
  - `npx prisma migrate deploy`
- Do not run `prisma migrate dev` in staging/production.
- Before running seed, backup the staging database first.
- Seed is only for UAT baseline data, not for production live data.
- For UAT only, run the seed after migrations and backup if baseline data is needed:
  - `npm run prisma:seed`

## Build And Start
- Backend:
  - `npm ci`
  - `npm run build`
  - `npm run start`
- Frontend:
  - `npm ci`
  - `npm run build`
  - `npm run start`
- PM2 sample config is in `deploy/ecosystem.config.js`; update `cwd`, ports, domains, and env values for the staging host.

## Health Check After Start
- Backend:
  - Open `GET /health`.
  - Verify API returns OK.
  - Verify database status is OK.
  - Verify storage/upload directory status is OK.
  - Verify backup directory status is OK.
  - Verify environment audit has no `critical` item.
- Frontend:
  - Open `/login` or `/authentication/sign-in`, depending on deployed route alias.
  - Open `/dashboard` after login.
  - Verify dashboard content follows the logged-in role.

## Seed Baseline
The seed is idempotent and prepares:
- Roles: Admin Sistem, Pengelola OPD, Analis Pertama, Analis Muda, Analis Madya, Kabid, Kepala Badan.
- Admin user and demo users per role.
- Unit organisasi baseline.
- ASN demo data.
- Jenis layanan and persyaratan layanan.
- SLA config per jenis layanan and tahap.
- Workflow transition rows per jenis layanan.

## UAT Accounts
- `admin` / `Admin@12345`
- `opd.disdik` / `Silakap@2026`
- `opd.dinkes` / `Silakap@2026`
- `analis.pertama` / `Silakap@2026`
- `analis.muda` / `Silakap@2026`
- `analis.madya` / `Silakap@2026`
- `kabid` / `Silakap@2026`
- `kepala.badan` / `Silakap@2026`

Change these passwords immediately for any shared staging environment.

## UAT Flow
- Admin Sistem: login, open dashboard, verify user management, role labels, referensi, SLA config, and audit log access.
- Pengelola OPD: create draft layanan, choose ASN and jenis layanan, upload required documents, submit.
- Analis Pertama: receive submitted usulan, terima, verify documents, teruskan or kembalikan with clear note.
- Pengelola OPD: open dikembalikan usulan, read note, upload ulang requested documents, kirim ulang.
- Analis Pertama: process resubmitted usulan.
- Analis Muda: verify and teruskan or kembalikan.
- Analis Madya: quality control and teruskan or kembalikan.
- Kabid: approve final for non-TTE service, or teruskan to Kepala Badan for service requiring TTE.
- Kepala Badan: final approval for service requiring TTE.
- Verify completed layanan with and without dokumen output behaves correctly.
- Verify dashboard role-aware content and `/layanan?status=...&tahap=...&q=...&page=...` filters survive refresh/share.

## Deployment Risks To Check
- Real secrets accidentally copied into committed files.
- `DATABASE_URL` missing connection pool parameters on busy staging.
- `UPLOAD_DIR` or `BACKUP_DIR` inside public web root.
- SMTP not configured, causing reset-password/register email UAT failures.
- Seed demo passwords left enabled in a public staging environment.
- PM2 sample paths/domains not updated from placeholders.

## Rollback Plan
- Save the last known stable commit hash before deployment.
- Save a database backup before running migration.
- If deployment fails, rollback code to the previous stable commit.
- If migration fails or corrupts staging data, restore the database backup.
