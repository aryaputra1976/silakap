// ecosystem.config.js — konfigurasi PM2 untuk Hostinger Node.js Manager
module.exports = {
  apps: [{
    name: 'silakap-api',
    script: 'dist/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    watch: false,
    max_memory_restart: '512M',
    env: {
      NODE_ENV: 'production',
    },
    error_file: 'logs/pm2-error.log',
    out_file: 'logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    restart_delay: 3000,
    max_restarts: 10,
    // Graceful shutdown — beri waktu request yang sedang berjalan selesai
    kill_timeout: 5000,
    listen_timeout: 8000,
  }],
}
