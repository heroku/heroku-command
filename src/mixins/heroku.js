// @flow

import http from '../http'
import type Command from '../command'

type Options = {
  required?: boolean
}

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
      auth = netrc.machines['api.heroku.com'].password
    }
    if (!auth && this.options.required !== false) {
      throw new Error('Not logged in')
    }
    return auth
  }
}
