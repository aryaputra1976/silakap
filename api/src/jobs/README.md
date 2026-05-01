SETUP CRON DI HOSTINGER hPANEL > Advanced > Cron Jobs:

Setiap 30 menit (SLA check):
*/30 * * * * curl -s -X POST https://DOMAIN/api/v1/jobs/sla-check -H "x-cron-secret: CRON_SECRET"

Jam 16:00 setiap hari (laporan harian):
0 16 * * * curl -s -X POST https://DOMAIN/api/v1/jobs/laporan-harian -H "x-cron-secret: CRON_SECRET"

Jam 01:00 tanggal 1 (laporan bulanan):
0 1 1 * * curl -s -X POST https://DOMAIN/api/v1/jobs/laporan-bulanan -H "x-cron-secret: CRON_SECRET"

Jam 07:00 setiap hari (pensiun reminder):
0 7 * * * curl -s -X POST https://DOMAIN/api/v1/jobs/pensiun-reminder -H "x-cron-secret: CRON_SECRET"
