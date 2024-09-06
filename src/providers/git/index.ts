import { cached, providerFromFunctions } from '@tmplr/core'

import { GitInstance } from './instance'


const safe = <T>(fn: () => Promise<T>) => async () => {
  try {
    return await fn()
  } catch {
    return undefined
  }
}

export function createGitProvider(scope: string) {
  const instance = new GitInstance(scope)

  const valid = cached(async () => instance.valid())
  const hasRemote = cached(async () => instance.hasRemote())
  const hasCommits = cached(async () => instance.hasCommits())
  const remoteDetailsCached = cached(safe(async () => instance.remoteDetails()))
  const initialCommitCached = cached(safe(async () => instance.initialCommit()))

  const provider = providerFromFunctions({
    remote_url: async () => (await remoteDetailsCached())?.href || '',
    remote_provider: async () => (await remoteDetailsCached())?.resource || '',
    remote_owner: async () => (await remoteDetailsCached())?.owner || '',
    remote_name: async () => (await remoteDetailsCached())?.name || '',
    author_name: async () => (await initialCommitCached())?.author_name || '',
    author_email: async () => (await initialCommitCached())?.author_email || '',
  })

  return {
    ...provider,
    has: async (key: string) => {
      if (key.startsWith('remote_')) {
        return (await valid()) && (await hasRemote()) && (await provider.has(key))
      } else {
        return (await valid()) && (await hasCommits()) && (await provider.has(key))
      }
    }
  }
}
