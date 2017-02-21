// @flow

import util from 'util'
import http from 'http-call'
import type Base from './base'

export default (base: Base) => class HTTP extends http {
  headers = {
    'user-agent': `${base.config.name}/${base.config.version} node-${process.version}`
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
    base.stderr.log(`--> ${this.method} ${this.url}`)
    if (base.config.debugging > 1) {
      base.error(this.renderHeaders(this.headers))
      // if (body) this.error(`--- BODY\n${util.inspect(body)}\n---`)
    }
  }

  logResponse () {
    if (!this.debugging) return
    base.error(`<-- ${this.method} ${this.url} ${this.response.statusCode}`)
    if (base.config.debugging > 1) {
      base.error(this.renderHeaders(this.response.headers))
      if (this.body) base.error(`--- BODY\n${util.inspect(this.body)}\n---`)
    }
  }
}
