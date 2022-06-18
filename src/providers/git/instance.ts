import parse from 'git-url-parse'
import Git, { SimpleGit } from 'simple-git'


export class GitInstance {
  private git: SimpleGit

  constructor(
    readonly scope: string,
  ) {
    this.git = Git(this.scope)
  }

  async valid() {
    try {
      await this.git.status()

      return true
    } catch {
      return false
    }
  }

  async initialCommit() {
    const hash = await this.git.raw('rev-list', '--max-parents=0', 'HEAD')
    const commits = await this.git.log(['-1', hash.trim()])

    return commits.latest
  }

  async remoteURL() {
    const url = await this.git.remote(['get-url', 'origin'])

    return (url as string).trim()
  }

  async remoteDetails() {
    const url = await this.remoteURL()

    return parse(url)
  }
}
