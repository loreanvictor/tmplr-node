import { FileSystem, AccessError } from '@tmplr/core'
import degit from 'degit'
import { readFile, writeFile, access, mkdir, rm } from 'fs/promises'
import { join, isAbsolute, dirname, relative, normalize, resolve, basename } from 'path'


export class NodeFS implements FileSystem {
  readonly root: string
  readonly scope: string

  constructor(
    scope = process.cwd(),
    root = scope,
  ) {
    this.root = resolve(root)
    this.scope = resolve(scope)
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
    return normalize(isAbsolute(path) ? path : join(this.root, path))
  }

  dirname(path: string): string {
    return dirname(this.absolute(path))
  }

  basename(path: string): string {
    return basename(path)
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

    const emitter = degit(remote, {
      cache: false,
      force: true
    })

    await emitter.clone(abs)
  }
}
