// Setup env vars minimum agar modul yang bergantung pada env.ts bisa diimport saat test
process.env['NODE_ENV'] = 'test'
process.env['DATABASE_URL'] = 'mysql://test:test@localhost:3306/test_db'
process.env['JWT_SECRET'] = 'test-jwt-secret-minimum-32-chars-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
process.env['JWT_REFRESH_SECRET'] = 'test-refresh-secret-minimum-32-chars-xxxxxxxxxxxxxxxxxxxxxxxxxxxx'
