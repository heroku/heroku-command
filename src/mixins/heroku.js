// @flow

import http from '../http'
import type Command from '../command'
import url from 'url'

type Options = {
  required?: boolean
}

const host = process.env.HEROKU_HOST || 'heroku.com'
const apiHost = host.startsWith('http') ? host : `https://api.${host}`
let gitHost = process.env.HEROKU_GIT_HOST
if (!gitHost) {
  if (host.startsWith('http')) {
    const u = url.parse(host)
    if (u.host) gitHost = u.host
  }
  if (!gitHost) gitHost = host
}
let httpGitHost = process.env.HEROKU_GIT_HOST
if (!httpGitHost) {
  if (host.startsWith('http')) {
    const u = url.parse(host)
    if (u.host) httpGitHost = u.host
  }
  httpGitHost = `git.${host}`
}

export const gitPrefixes = [
  `git@${gitHost}:`,
  `ssh://git@${gitHost}/`,
  `https://${httpGitHost}/`
]

export default class Heroku extends http {
  options: Options
  constructor (cmd: Command, options: Options = {}) {
    super(cmd)
    if (options.required === undefined) options.required = true
    this.options = options
    this.requestOptions.host = 'api.heroku.com'
    this.requestOptions.protocol = 'https:'
    if (this.auth) this.requestOptions.headers['authorization'] = `:${this.auth}`
    this.requestOptions.headers['user-agent'] = `heroku-cli/${this.out.config.version}`
    this.requestOptions.headers['accept'] = 'application/vnd.heroku+json; version=3'
  }

  get auth (): ?string {
    let auth = process.env.HEROKU_API_KEY
    if (!auth) {
      const Netrc = require('netrc-parser')
      const netrc = new Netrc()
      auth = netrc.machines[apiHost].password
    }
    if (!auth && this.options.required !== false) {
      throw new Error('Not logged in')
    }
    return auth
  }
}
