#!/usr/bin/env node

const baseUrl = process.env.PERF_BASE_URL ?? 'http://localhost:3100'
const apiPrefix = process.env.PERF_API_PREFIX ?? '/api/v1'
const concurrency = Number(process.env.PERF_CONCURRENCY ?? 20)
const totalRequests = Number(process.env.PERF_REQUESTS ?? 200)
const p95TargetMs = Number(process.env.PERF_P95_TARGET_MS ?? 500)
const endpoints = (process.env.PERF_ENDPOINTS ?? '/health,/dashboard/ringkasan,/notifikasi/count')
  .split(',')
  .map((endpoint) => endpoint.trim())
  .filter(Boolean)

const normalizeUrl = (endpoint) => {
  if (endpoint.startsWith('http')) return endpoint
  if (endpoint === '/health') return `${baseUrl}/health`
  return `${baseUrl}${apiPrefix}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`
}

const percentile = (values, percent) => {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const index = Math.ceil((percent / 100) * sorted.length) - 1
  return sorted[Math.max(0, Math.min(index, sorted.length - 1))]
}

const login = async () => {
  if (process.env.PERF_TOKEN) return process.env.PERF_TOKEN
  if (!process.env.PERF_USERNAME || !process.env.PERF_PASSWORD) return ''

  const response = await fetch(`${baseUrl}${apiPrefix}/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      username: process.env.PERF_USERNAME,
      password: process.env.PERF_PASSWORD,
    }),
  })
  if (!response.ok) throw new Error(`Login failed: HTTP ${response.status}`)
  const payload = await response.json()
  return payload?.data?.accessToken ?? payload?.data?.token ?? ''
}

const runOne = async (url, token) => {
  const started = performance.now()
  let status = 0
  let ok = false
  let error = ''
  try {
    const response = await fetch(url, {
      headers: token ? { authorization: `Bearer ${token}` } : {},
    })
    status = response.status
    ok = response.ok || response.status === 401
    await response.arrayBuffer()
  } catch (caught) {
    error = caught instanceof Error ? caught.message : String(caught)
  }
  return {
    url,
    status,
    ok,
    error,
    durationMs: Math.round((performance.now() - started) * 100) / 100,
  }
}

const main = async () => {
  if (!Number.isFinite(concurrency) || concurrency < 1) throw new Error('PERF_CONCURRENCY must be >= 1')
  if (!Number.isFinite(totalRequests) || totalRequests < 1) throw new Error('PERF_REQUESTS must be >= 1')

  const urls = endpoints.map(normalizeUrl)
  const token = await login()
  const results = []
  let next = 0

  const worker = async () => {
    while (next < totalRequests) {
      const current = next
      next += 1
      results.push(await runOne(urls[current % urls.length], token))
    }
  }

  const started = performance.now()
  await Promise.all(Array.from({ length: concurrency }, worker))
  const totalDurationMs = Math.round(performance.now() - started)
  const durations = results.map((result) => result.durationMs)
  const failures = results.filter((result) => !result.ok)
  const p95 = percentile(durations, 95)

  const byEndpoint = urls.map((url) => {
    const subset = results.filter((result) => result.url === url)
    return {
      url,
      requests: subset.length,
      p95Ms: percentile(subset.map((result) => result.durationMs), 95),
      maxMs: Math.max(...subset.map((result) => result.durationMs)),
      failures: subset.filter((result) => !result.ok).length,
    }
  })

  const report = {
    target: { p95Ms: p95TargetMs, concurrency, totalRequests },
    summary: {
      p50Ms: percentile(durations, 50),
      p95Ms: p95,
      maxMs: Math.max(...durations),
      successRate: `${Math.round(((results.length - failures.length) / results.length) * 10000) / 100}%`,
      totalDurationMs,
    },
    byEndpoint,
    failures: failures.slice(0, 10),
  }

  console.log(JSON.stringify(report, null, 2))
  if (failures.length > 0 || p95 > p95TargetMs) process.exitCode = 1
}

void main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
