import { mkdtemp, rm } from 'fs/promises'
import { join } from 'path'
import { CleanableProvider, cached, CachedFunction } from '@tmplr/core'


export function createTmpDirProvider(scope: string): CleanableProvider {
  const dirs: {[name: string]: CachedFunction<string>} = {}

  return {
    has: async () => true,
    get: (name: string) => {
      if (!(name in dirs)) {
        dirs[name] = cached(async () => mkdtemp(join(scope, `${name}-`)))
      }

      return dirs[name]!
    },
    isolate: () => createTmpDirProvider(scope),
    cleanup: async () => {
      await Promise.all(
        Object.values(dirs).map(
          async dir => await rm(await dir(), { force: true, recursive: true })
        )
      )
    }
  }
}
