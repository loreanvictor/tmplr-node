import tiged from 'tiged'


jest.mock('tiged', () => {
  const clone = jest.fn(() => Promise.resolve())

  return {
    __esModule: true,
    clone,
    default: jest.fn(() => ({ clone })),
  }
})

import { isAbsolute, join } from 'path'
import { mkdir, rm, writeFile, readFile, access } from 'fs/promises'

import { AccessError } from '@tmplr/core'
import { NodeFS } from '../node-fs'
import { slash } from '../slash'


describe(NodeFS, () => {
  beforeEach(async () => {
    await rm('tmp', { recursive: true, force: true })
    await mkdir('tmp')
  })

  afterEach(async () => {
    await rm('tmp', { recursive: true, force: true })
  })

  test('by default will assume process.cwd() as its scope and root.', () => {
    const fs = new NodeFS()
    expect(fs.scope).toBe(slash(process.cwd()))
    expect(fs.root).toBe(slash(process.cwd()))
  })

  test('its root and scope are absolute.', () => {
    const fs = new NodeFS('tmp')

    expect(isAbsolute(fs.scope)).toBe(true)
    expect(isAbsolute(fs.root)).toBe(true)
  })

  describe('.read()', () => {
    test('can read files based on given root / scope.', async () => {
      await writeFile('tmp/foo.txt', 'foo')

      const fs = new NodeFS('tmp')
      await expect(fs.read('foo.txt')).resolves.toBe('foo')
    })

    test('can not read files outside of its scope.', async () => {
      await mkdir('tmp/bar')
      await writeFile('tmp/foo.txt', 'foo')
      await writeFile('tmp/bar/baz.txt', 'baz')

      const fs = new NodeFS('tmp/bar')
      await expect(fs.read('../bar/baz.txt')).resolves.toBe('baz')
      await expect(fs.read(join(process.cwd(), 'tmp/foo.txt'))).rejects.toThrow(AccessError)
    })

    test('can read files outside of its root within its scope.', async () => {
      await mkdir('tmp/bar')
      await writeFile('tmp/foo.txt', 'foo')
      await writeFile('tmp/bar/baz.txt', 'baz')

      const fs = new NodeFS('tmp', 'tmp/bar')
      await expect(fs.read('../foo.txt')).resolves.toBe('foo')
    })
  })

  describe('.access()', () => {
    test('can access files based on given root / scope.', async () => {
      await writeFile('tmp/foo.txt', 'foo')

      const fs = new NodeFS('tmp')
      await expect(fs.access('foo.txt')).resolves.not.toThrow()
    })

    test('can not access files outside of its scope.', async () => {
      await mkdir('tmp/bar')
      await writeFile('tmp/foo.txt', 'foo')
      await writeFile('tmp/bar/baz.txt', 'baz')

      const fs = new NodeFS('tmp/bar')
      await expect(fs.access('../bar/baz.txt')).resolves.not.toThrow()
      await expect(fs.access(join(process.cwd(), 'tmp/foo.txt'))).rejects.toThrow()
    })

    test('can access files outside of its root within its scope.', async () => {
      await mkdir('tmp/bar')
      await writeFile('tmp/foo.txt', 'foo')
      await writeFile('tmp/bar/baz.txt', 'baz')

      const fs = new NodeFS('tmp', 'tmp/bar')
      await expect(fs.access('../foo.txt')).resolves.not.toThrow()
    })
  })

  describe('.write()', () => {
    test('can write files based on given root / scope.', async () => {
      const fs = new NodeFS('tmp')
      await fs.write('bar/foo.txt', 'foo')

      await expect(readFile('tmp/bar/foo.txt', 'utf8')).resolves.toBe('foo')
    })

    test('can not write files outside of its scope.', async () => {
      await mkdir('tmp/bar')

      const fs = new NodeFS('tmp/bar')
      await expect(fs.write('../foo.txt', 'foo')).rejects.toThrow(AccessError)
      await fs.write(join(process.cwd(), 'tmp/bar/baz.txt'), 'baz')
      await expect(readFile('tmp/bar/baz.txt', 'utf8')).resolves.toBe('baz')
    })

    test('can read files outside of its root within its scope.', async () => {
      await mkdir('tmp/bar')

      const fs = new NodeFS('tmp', 'tmp/bar')
      await fs.write('../foo.txt', 'foo')
      await expect(readFile('tmp/foo.txt', 'utf8')).resolves.toBe('foo')
    })
  })

  describe('.rm()', () => {
    test('can remove files based on given root / scope.', async () => {
      await writeFile('tmp/foo.txt', 'foo')

      const fs = new NodeFS('tmp')
      await fs.rm('foo.txt')
      await expect(access('tmp/foo.txt')).rejects.toThrow()
    })

    test('can not remove files outside of its scope.', async () => {
      await mkdir('tmp/bar')
      await writeFile('tmp/foo.txt', 'foo')
      await writeFile('tmp/bar/baz.txt', 'baz')

      const fs = new NodeFS('tmp/bar')
      await fs.rm('../bar/baz.txt')
      await expect(fs.rm(join(process.cwd(), 'tmp/foo.txt'))).rejects.toThrow()
      await expect(access('tmp/bar/baz.txt')).rejects.toThrow()
      await expect(access('tmp/foo.txt')).resolves.not.toThrow()
    })

    test('can remove files outside of its root within its scope.', async () => {
      await mkdir('tmp/bar')
      await mkdir('tmp/baz')
      await writeFile('tmp/baz/foo.txt', 'foo')

      const fs = new NodeFS('tmp', 'tmp/bar')
      await fs.rm('../baz')
      await expect(access('tmp/baz/foo.txt')).rejects.toThrow()
    })
  })

  describe('.cd()', () => {
    test('can access files within its given root.', async () => {
      await mkdir('tmp/foo')
      await writeFile('tmp/foo/bar.txt', 'bar')

      const fs = new NodeFS('tmp')
      const cd = fs.cd('foo')
      await expect(cd.read('bar.txt')).resolves.toBe('bar')
    })

    test('can also access files within its parent scope.', async () => {
      await mkdir('tmp/foo')
      const fs = new NodeFS('tmp')
      await fs.cd('foo').write('../bar.txt', 'bar')

      await expect(readFile('tmp/bar.txt', 'utf8')).resolves.toBe('bar')
    })

    test('cannot access files outside of its parent scope.', async () => {
      await mkdir('tmp/foo')
      await mkdir('tmp/foo/bar')
      await writeFile('tmp/baz.txt', 'baz')

      const fs = new NodeFS('tmp/foo')
      const cd = fs.cd('bar')
      await expect(cd.read('../../baz.txt')).rejects.toThrow(AccessError)
    })
  })

  describe('fetch()', () => {
    test('calls degit to fetch remote into given directory.', async () => {
      const fs = new NodeFS('tmp')
      await fs.fetch('foo', 'bar')

      await expect(access('tmp/bar')).resolves.not.toThrow()

      expect(tiged).toHaveBeenCalledWith('foo', {
        cache: false,
        force: true
      })

      expect((tiged('').clone as jest.Mock).mock.lastCall[0]).toMatch(/\/tmp\/bar$/)
    })

    test('cannot clone into a folder out of scope.', async () => {
      await mkdir('tmp/foo')

      const fs = new NodeFS('tmp/foo')
      await expect(fs.fetch('foo', '../')).rejects.toThrow(AccessError)
    })

    test('can fetch locally.', async () => {
      await mkdir('tmp/foo')
      await mkdir('tmp/bar')
      await writeFile('tmp/foo/baz.txt', 'baz')
      await writeFile('tmp/foo/qux.txt', 'qux')

      const fs = new NodeFS('tmp/bar')
      await fs.fetch('local:../foo', 'fred')

      await expect(access('tmp/bar/fred')).resolves.not.toThrow()
      await expect(access('tmp/bar/fred/baz.txt')).resolves.not.toThrow()
      await expect(access('tmp/bar/fred/qux.txt')).resolves.not.toThrow()
      await expect(access('tmp/bar/foo')).rejects.toThrow()
      await expect(readFile('tmp/bar/fred/baz.txt', 'utf8')).resolves.toBe('baz')
      await expect(readFile('tmp/bar/fred/qux.txt', 'utf8')).resolves.toBe('qux')

      await expect(fs.fetch('local:../foo', '../thud')).rejects.toThrow(AccessError)
    })
  })

  describe('dirname()', () => {
    test('returns the absolute dirname of a path.', () => {
      const fs = new NodeFS('tmp')
      expect(fs.dirname('foo/bar/baz.txt')).toMatch(/\/tmp\/foo\/bar$/)
    })
  })

  describe('basename()', () => {
    test('returns the basename of a given path.', () => {
      const fs = new NodeFS('tmp')
      expect(fs.basename('foo/bar/')).toBe('bar')
    })
  })

  describe('ls()', () => {
    test('returns an array of all files in given directory (including subfiles).', async () => {
      await access('tmp')
      await mkdir('tmp/foo')
      await mkdir('tmp/foo/bar')
      await writeFile('tmp/baz.txt', 'baz')
      await writeFile('tmp/foo/baz.txt', 'baz')
      await writeFile('tmp/foo/bar/baz.txt', 'baz')

      const fs = new NodeFS('tmp')
      const files = await fs.ls('.')

      expect(files).toEqual(['baz.txt', 'foo/baz.txt', 'foo/bar/baz.txt'])
    })
  })
})
