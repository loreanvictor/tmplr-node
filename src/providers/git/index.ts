import { cached, providerFromFunctions } from '@tmplr/core'

import { GitInstance } from './instance'


export function createGitProvider(scope: string) {
  const instance = new GitInstance(scope)

  const valid = cached(async () => instance.valid())
  const remoteDetailsCached = cached(async () => instance.remoteDetails())
  const initialCommitCached = cached(async () => instance.initialCommit())

  const provider = providerFromFunctions({
    remote_url: async () => instance.remoteURL(),
    remote_provider: async () => (await remoteDetailsCached()).resource,
    remote_owner: async () => (await remoteDetailsCached()).owner,
    remote_name: async () => (await remoteDetailsCached()).name,
    author_name: async () => (await initialCommitCached())!.author_name,
    author_email: async () => (await initialCommitCached())!.author_email,
  })

  return {
    ...provider,
    has: async (key: string) => (await valid()) && (await provider.has(key))
  }
}
