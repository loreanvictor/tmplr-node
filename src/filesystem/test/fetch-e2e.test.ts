import { NodeFS } from '../node-fs'
import { mkdir, rm } from 'fs/promises'


beforeAll(async () => {
  await mkdir('e2e-tmp')
})

test('fetching works.', async () => {
  const fs = new NodeFS('e2e-tmp')
  await fs.fetch('loreanvictor/tmplr-template-example', 'example/stuff')
  await expect(fs.access('example/stuff/README.md')).resolves.not.toThrow()
  await expect(fs.access('example/stuff/.github/workflows/init.yml')).resolves.not.toThrow()
  await expect(fs.access('example/stuff/.github/workflows/init.json')).rejects.toThrow()
})

test('can fetch nested gitlab repositories', async () => {
  const fs = new NodeFS('e2e-tmp')
  await fs.fetch('gitlab:skewed-aspect/test-repos/tmplr-test', 'example/gl', true)
  await expect(fs.access('example/gl')).resolves.not.toThrow()
  await expect(fs.access('example/gl/README.md')).resolves.not.toThrow()
  await expect(fs.access('example/gl/baz.txt')).resolves.not.toThrow()
  await expect(fs.access('example/gl/qux.txt')).resolves.not.toThrow()
  await expect(fs.access('example/gl/nested/baz.txt')).resolves.not.toThrow()
  await expect(fs.access('example/gl/nested/qux.txt')).resolves.not.toThrow()
})

afterAll(async () => {
  await rm('e2e-tmp', { recursive: true })
})
