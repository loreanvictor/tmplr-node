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

afterAll(async () => {
  await rm('e2e-tmp', { recursive: true })
})
