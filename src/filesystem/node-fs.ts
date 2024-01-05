import { FileSystem, AccessError } from '@tmplr/core'
import degit from 'degit'
import { readFile, writeFile, access, mkdir, rm, readdir, stat, cp } from 'fs/promises'
import { join, isAbsolute, dirname, relative, normalize, resolve, basename } from 'path'

import { slash } from './slash'


export class NodeFS implements FileSystem {
  readonly root: string
  readonly scope: string

  constructor(
    scope = process.cwd(),
    root = scope,
  ) {
    this.root = slash(resolve(root))
    this.scope = slash(resolve(scope))
    this.checkSubPath(root)
  }

  protected checkSubPath(path: string) {
    const rel = relative(this.scope, path)
    if (isAbsolute(rel) || rel.startsWith('..')) {
      throw new AccessError(path, this.scope)
    }
  }

  protected async ensureSubPath(path: string) {
    this.checkSubPath(path)
    const abs = this.absolute(path)
    const rel = relative(this.root, abs)
    const dir = dirname(rel)

    if (dir !== '.') {
      await mkdir(this.absolute(dir), { recursive: true })
    }
  }

  absolute(path: string) {
    return slash(normalize(isAbsolute(path) ? path : join(this.root, path)))
  }

  dirname(path: string): string {
    return slash(dirname(this.absolute(path)))
  }

  basename(path: string): string {
    return slash(basename(path))
  }

  async read(path: string) {
    const abs = this.absolute(path)
    this.checkSubPath(abs)

    return await readFile(abs, 'utf8')
  }

  async write(path: string, content: string) {
    const abs = this.absolute(path)
    this.checkSubPath(abs)
    await this.ensureSubPath(abs)

    await writeFile(abs, content)
  }

  async access(path: string) {
    const abs = this.absolute(path)
    this.checkSubPath(abs)
    await access(abs)
  }

  async rm(path: string) {
    const abs = this.absolute(path)
    this.checkSubPath(abs)
    await rm(abs, { recursive: true, force: true })
  }

  async ls(path: string) {
    const abs = this.absolute(path)
    this.checkSubPath(abs)

    const paths: string[] = []
    await Promise.all(
      (await readdir(abs)).map(async (name) => {
        if ((await stat(join(abs, name))).isDirectory()) {
          paths.push(...(await this.ls(join(abs, name))).map(p => join(name, p)))
        } else {
          paths.push(name)
        }
      })
    )

    return paths.map(slash)
  }

  cd(path: string): FileSystem {
    const abs = this.absolute(path)
    this.checkSubPath(abs)

    return new NodeFS(this.scope, abs)
  }

  async fetch(remote: string, dest: string) {
    const abs = this.absolute(dest)
    this.checkSubPath(abs)
    const dir = relative(this.root, abs)

    if (dir !== '.') {
      await mkdir(abs, { recursive: true })
    }

    if (remote.startsWith('local:')) {
      const path = this.absolute(remote.slice(6))
      await cp(path, abs, { recursive: true })
    } else {
      const emitter = degit(remote, {
        cache: false,
        force: true
      })

      await emitter.clone(abs)
    }
  }
}
