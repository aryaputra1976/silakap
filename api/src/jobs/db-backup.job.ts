import { createWriteStream, promises as fs } from 'node:fs'
import path from 'node:path'
import { pipeline } from 'node:stream/promises'
import { spawn } from 'node:child_process'
import { createGzip } from 'node:zlib'
import { env } from '@/core/config/env'

type BackupResult = {
  filename: string
  path: string
  size: number
  retained: number
}

const parseDatabaseUrl = () => {
  const url = new URL(env.DATABASE_URL)
  if (!url.pathname || url.pathname === '/') throw new Error('DATABASE_URL tidak memiliki nama database')
  return {
    host: url.hostname,
    port: url.port || '3306',
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(url.pathname.replace(/^\//, '')),
  }
}

const timestamp = (): string =>
  new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').replace('Z', '')

const pruneBackups = async (): Promise<number> => {
  const files = (await fs.readdir(env.BACKUP_DIR))
    .filter((file) => file.startsWith('silakap-db-') && file.endsWith('.sql.gz'))
    .map((file) => ({ file, fullPath: path.join(env.BACKUP_DIR, file) }))

  const withStats = await Promise.all(
    files.map(async (item) => ({ ...item, stat: await fs.stat(item.fullPath) })),
  )
  withStats.sort((a, b) => b.stat.mtimeMs - a.stat.mtimeMs)

  const keep = withStats.slice(0, env.BACKUP_RETENTION_FILES)
  const remove = withStats.slice(env.BACKUP_RETENTION_FILES)
  await Promise.all(remove.map((item) => fs.unlink(item.fullPath)))
  return keep.length
}

export const jalankanBackupDatabase = async (): Promise<BackupResult> => {
  await fs.mkdir(env.BACKUP_DIR, { recursive: true, mode: 0o700 })
  const config = parseDatabaseUrl()
  const filename = `silakap-db-${config.database}-${timestamp()}.sql.gz`
  const targetPath = path.join(env.BACKUP_DIR, filename)
  const tmpPath = `${targetPath}.tmp`

  const args = [
    `--host=${config.host}`,
    `--port=${config.port}`,
    `--user=${config.user}`,
    '--single-transaction',
    '--quick',
    '--routines',
    '--triggers',
    config.database,
  ]

  const dump = spawn(env.MYSQLDUMP_BIN, args, {
    env: { ...process.env, MYSQL_PWD: config.password },
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  let stderr = ''
  dump.stderr.on('data', (chunk) => {
    stderr += String(chunk)
  })

  const processResult = new Promise<number | null>((resolve, reject) => {
    dump.on('error', reject)
    dump.on('close', resolve)
  })
  await pipeline(dump.stdout, createGzip({ level: 9 }), createWriteStream(tmpPath, { mode: 0o600 }))

  const exitCode = await processResult
  if (exitCode !== 0) {
    await fs.rm(tmpPath, { force: true })
    throw new Error(`mysqldump gagal dengan exit code ${exitCode}: ${stderr.trim()}`)
  }

  await fs.rename(tmpPath, targetPath)
  const retained = await pruneBackups()
  const stat = await fs.stat(targetPath)
  return { filename, path: targetPath, size: stat.size, retained }
}

export const listBackups = async () => {
  await fs.mkdir(env.BACKUP_DIR, { recursive: true, mode: 0o700 })
  const files = await fs.readdir(env.BACKUP_DIR)
  return Promise.all(
    files
      .filter((file) => file.startsWith('silakap-db-') && file.endsWith('.sql.gz'))
      .map(async (file) => {
        const fullPath = path.join(env.BACKUP_DIR, file)
        const stat = await fs.stat(fullPath)
        return { filename: file, path: fullPath, size: stat.size, createdAt: stat.birthtime }
      }),
  ).then((items) => items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()))
}
