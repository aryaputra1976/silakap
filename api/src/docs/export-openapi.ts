import { promises as fs } from 'node:fs'
import path from 'node:path'
import { openApiDocument } from './openapi'

const target = path.resolve(process.cwd(), 'openapi.json')

const main = async (): Promise<void> => {
  await fs.writeFile(target, `${JSON.stringify(openApiDocument, null, 2)}\n`, 'utf8')
  console.log(`OpenAPI JSON exported to ${target}`)
}

void main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
