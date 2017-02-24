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
    if (!base.config.debug) return
    base.stderr.log(`--> ${this.method} ${this.url}`)
    if (base.config.debug > 1) {
      base.stderr.log(this.renderHeaders(this.headers))
      // if (body) this.error(`--- BODY\n${util.inspect(body)}\n---`)
    }
  }

  logResponse () {
    if (!base.config.debug) return
    base.stderr.log(`<-- ${this.method} ${this.url} ${this.response.statusCode}`)
    if (base.config.debug > 1) {
      base.stderr.log(this.renderHeaders(this.response.headers))
      if (this.body) base.stderr.log(`--- BODY\n${util.inspect(this.body)}\n---`)
    }
  }
}
