import { NodeFS } from '../node-fs'
import { mkdir, rm } from 'fs/promises'


beforeAll(async () => {
  await mkdir('tmp')
})

test('fetching works.', async () => {
  const fs = new NodeFS('tmp')
  await fs.fetch('loreanvictor/tmplr-template-example', 'example')
  await expect(fs.access('example/README.md')).resolves.not.toThrow()
  await expect(fs.access('example/.github/workflows/init.yml')).resolves.not.toThrow()
  await expect(fs.access('example/.github/workflows/init.json')).rejects.toThrow()
})

afterAll(async () => {
  await rm('tmp', { recursive: true })
})
