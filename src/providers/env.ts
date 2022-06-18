import { Provider, cached } from '@tmplr/core'


export function createEnvProvider(): Provider {
  return ({
    async has(key: string) {
      return !!process.env[key]
    },

    get: (key: string) => cached(async () => process.env[key] as string),
  })
}
