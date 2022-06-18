import { access } from 'fs/promises'

import { createTmpDirProvider } from '../tmpdir'


describe(createTmpDirProvider, () => {
  test('creates temporary directories on demand and removes them on clear.', async () => {
    const provider = createTmpDirProvider(process.cwd())

    await expect(provider.has('something')).resolves.toBe(true)

    const folder1 = await provider.get('something_else')()
    const folder2 = await provider.get('something_else')()
    const folder3 = await provider.get('something_else_else')()

    expect(folder2).toBe(folder1)
    expect(folder3).not.toBe(folder1)

    await expect(access(folder1)).resolves.not.toThrow()
    await expect(access(folder2)).resolves.not.toThrow()
    await expect(access(folder3)).resolves.not.toThrow()

    await provider.cleanup()
    await expect(access(folder1)).rejects.toThrow()
    await expect(access(folder2)).rejects.toThrow()
    await expect(access(folder3)).rejects.toThrow()
  })

  test('properly isolates itself.', async () => {
    const provider = createTmpDirProvider(process.cwd())
    const provider2 = provider.isolate()

    const folder1 = await provider.get('something')()
    const folder2 = await provider.get('something')()
    const folder3 = await provider2.get('something')()
    const folder4 = await provider2.get('something')()

    expect(folder1).toBe(folder2)
    expect(folder3).toBe(folder4)
    expect(folder1).not.toBe(folder3)

    await provider.cleanup()

    await expect(access(folder1)).rejects.toThrow()
    await expect(access(folder3)).resolves.not.toThrow()

    await provider2.cleanup()

    await expect(access(folder3)).rejects.toThrow()
  })
})
