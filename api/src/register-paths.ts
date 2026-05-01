import path from 'node:path'
import Module from 'node:module'

type ModuleResolver = typeof Module & {
  _resolveFilename: (
    request: string,
    parent: NodeModule | null | undefined,
    isMain: boolean,
    options?: unknown,
  ) => string
}

const moduleResolver = Module as ModuleResolver
const globalState = globalThis as typeof globalThis & { __silakapAliasRegistered?: boolean }

if (!globalState.__silakapAliasRegistered) {
  const originalResolveFilename = moduleResolver._resolveFilename

  moduleResolver._resolveFilename = function resolveSilakapAlias(request, parent, isMain, options) {
    if (request.startsWith('@/')) {
      return originalResolveFilename.call(this, path.join(__dirname, request.slice(2)), parent, isMain, options)
    }

    return originalResolveFilename.call(this, request, parent, isMain, options)
  }

  globalState.__silakapAliasRegistered = true
}
