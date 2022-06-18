import { createEnvProvider } from '../env'


const setEnv = (key: string, val: string) => {
  (process.env as any)[key] = val
}


describe(createEnvProvider, () => {
  const OG_ENV = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...OG_ENV }
  })

  afterEach(() => {
    process.env = OG_ENV
  })

  test('returns a provider providing environment variables.', async () => {
    setEnv('foo', 'bar')
    const provider = createEnvProvider()

    await expect(provider.get('foo')()).resolves.toBe('bar')

    delete process.env['foo']

    await expect(provider.has('foo')).resolves.toBe(false)
  })
})
