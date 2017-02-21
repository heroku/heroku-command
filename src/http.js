// @flow

import util from 'util'
import http from 'http-call'
import type Command from './command'

export default (cmd: Command) => class HTTP extends http {
  headers = {
    'user-agent': `${cmd.config.name}/${cmd.config.version} node-${process.version}`
  }

  async request () {
    this.logRequest()
    await super.request()
    this.logResponse()
  }

  renderHeaders (headers: {[key: string]: string}) {
    return Object.keys(headers).map(key => {
      let value = key.toUpperCase() === 'AUTHORIZATION' ? 'REDACTED' : headers[key]
      return '    ' + key + '=' + value
    }).join('\n')
  }

  logRequest () {
    if (!this.debugging) return
    cmd.error(`--> ${this.method} ${this.url}`)
    if (cmd.debugging > 1) {
      cmd.error(this.renderHeaders(this.headers))
      // if (body) this.error(`--- BODY\n${util.inspect(body)}\n---`)
    }
  }

  logResponse () {
    if (!this.debugging) return
    cmd.error(`<-- ${this.method} ${this.url} ${this.response.statusCode}`)
    if (cmd.debugging > 1) {
      cmd.error(this.renderHeaders(this.response.headers))
      if (this.body) cmd.error(`--- BODY\n${util.inspect(this.body)}\n---`)
    }
  }
}
