// @flow
/* globals
   Class
 */

import util from 'util'
import Base from './base'
import HTTP from 'http-call'

export default (Base: Class<Base>) => class extends Base {
  _http: Class<HTTP>

  get http (): Class<HTTP> {
    if (this._http) return this._http
    const base = this
    this._http = class DebugHTTP extends HTTP {
      headers = {
        'user-agent': `${base.config.name}/${base.config.version} node-${process.version}`
      }

      async request () {
        this.logRequest()
        await super.request()
        this.logResponse()
      }

      renderHeaders (headers) {
        return Object.keys(headers).map(key => {
          let value = key.toUpperCase() === 'AUTHORIZATION' ? 'REDACTED' : headers[key]
          return '    ' + key + '=' + value
        }).join('\n')
      }

      logRequest () {
        if (!this.debugging) return
        base.error(`--> ${this.method} ${this.url}`)
        if (base.debugging > 1) {
          base.error(this.renderHeaders(this.headers))
          // if (body) this.error(`--- BODY\n${util.inspect(body)}\n---`)
        }
      }

      logResponse () {
        if (!this.debugging) return
        base.error(`<-- ${this.method} ${this.url} ${this.response.statusCode}`)
        if (base.debugging > 1) {
          base.error(this.renderHeaders(this.response.headers))
          if (this.body) base.error(`--- BODY\n${util.inspect(this.body)}\n---`)
        }
      }
    }
    return this._http
  }
}
