import { execSync } from 'child_process'
import { mkdtemp } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'

import { GitInstance } from '../git/instance'
import { createGitProvider } from '../git'


describe(createGitProvider, () => {
  test('resolves proper git values.', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'tmplr-test-'))

    execSync('git clone https://github.com/loreanvictor/tmplr-node.git', { cwd: tempDir })

    const provider = createGitProvider(join(tempDir, 'tmplr-node'))

    await expect(provider.has('remote_url')).resolves.toBe(true)
    await expect(provider.get('remote_provider')()).resolves.toBe('github.com')
    await expect(provider.get('remote_owner')()).resolves.toBe('loreanvictor')
    await expect(provider.get('remote_name')()).resolves.toBe('tmplr-node')
    await expect(provider.has('author_name')).resolves.toBe(true)
    await expect(provider.get('author_name')()).resolves.toMatch(/Eugene Ghanizadeh/)
    await expect(provider.get('author_email')()).resolves.toBe('ghanizadeh.eugene@gmail.com')
  })

  test('behaves as expected in a non-git folder.', async () => {
    const provider = createGitProvider(await mkdtemp(join(tmpdir(), 'tmplr-test-')))

    await expect(provider.has('remote_url')).resolves.toBe(false)
    await expect(provider.get('remote_url')()).resolves.toBe('')
    await expect(provider.get('remote_provider')()).resolves.toBe('')
  })

  test('behaves as expected in a git folder without a remote or commits.', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'tmplr-test-'))
    execSync('git init', { cwd: tempDir })
    const provider = createGitProvider(tempDir)

    await expect(provider.has('remote_url')).resolves.toBe(false)
    await expect(provider.has('remote_owner')).resolves.toBe(false)
    await expect(provider.get('remote_url')()).resolves.toBe('')
    await expect(provider.get('remote_owner')()).resolves.toBe('')
    await expect(provider.get('remote_name')()).resolves.toBe('')
    await expect(provider.get('remote_provider')()).resolves.toBe('')

    await expect(provider.has('author_name')).resolves.toBe(false)
    await expect(provider.get('author_name')()).resolves.toBe('')
    await expect(provider.get('author_email')()).resolves.toBe('')
  })

  test('gracefully handles the situation where there are no commits.', async () => {
    jest.spyOn(GitInstance.prototype, 'initialCommit').mockRejectedValue(new Error('no commits'))
    const provider = createGitProvider(process.cwd())

    await expect(provider.get('author_name')()).resolves.toBe('')
    await expect(provider.get('author_email')()).resolves.toBe('')

    jest.spyOn(GitInstance.prototype, 'initialCommit').mockRestore()
  })
})
