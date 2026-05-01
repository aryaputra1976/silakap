#!/usr/bin/env node

import { promises as fs } from 'node:fs'
import path from 'node:path'

const distDir = process.env.NEXT_DIST_DIR ?? '.next'
const root = path.resolve(process.cwd(), distDir)
const staticDir = path.join(root, 'static')
const limitMb = Number(process.env.BUNDLE_LIMIT_MB ?? 5)
const extensions = new Set(['.js', '.css'])

const walk = async (dir) => {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const nested = await Promise.all(entries.map(async (entry) => {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) return walk(fullPath)
    if (entry.isFile() && extensions.has(path.extname(entry.name))) return [fullPath]
    return []
  }))
  return nested.flat()
}

const main = async () => {
  const files = await walk(staticDir)
  const rows = await Promise.all(files.map(async (file) => {
    const stat = await fs.stat(file)
    return { file: path.relative(root, file), bytes: stat.size }
  }))
  const totalBytes = rows.reduce((sum, row) => sum + row.bytes, 0)
  const limitBytes = limitMb * 1024 * 1024
  const largest = rows.sort((a, b) => b.bytes - a.bytes).slice(0, 10)
  const report = {
    distDir,
    target: { maxBundleMb: limitMb },
    totalMb: Math.round((totalBytes / 1024 / 1024) * 100) / 100,
    filesChecked: rows.length,
    largest,
  }

  console.log(JSON.stringify(report, null, 2))
  if (totalBytes > limitBytes) process.exitCode = 1
}

void main().catch((error) => {
  console.error(`Bundle check failed. Build first with npm run build. ${error instanceof Error ? error.message : String(error)}`)
  process.exitCode = 1
})
