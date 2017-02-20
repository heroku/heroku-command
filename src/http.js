// @flow
/* globals
   Class
 */

import util from 'util'
import Base from './base'
import HTTP from 'http-call'

function renderHeaders (headers) {
  return Object.keys(headers).map(key => {
    let value = key.toUpperCase() === 'AUTHORIZATION' ? 'REDACTED' : headers[key]
    return '    ' + key + '=' + value
  }).join('\n')
}

export function logRequest (http: HTTP) {
  if (!this.debugging) return
  this.error(`--> ${http.method} ${http.url}`)
  if (this.debugging > 1) {
    this.error(renderHeaders(http.headers))
    // if (body) this.error(`--- BODY\n${util.inspect(body)}\n---`)
  }
}

export function logResponse (http: HTTP, response: any) {
  if (!this.debugging) return
  this.error(`<-- ${http.method} ${http.url} ${http.response.statusCode}`)
  if (this.debugging > 1) {
    this.error(renderHeaders(http.response.headers))
    this.error(`--- BODY\n${util.inspect(response)}\n---`)
  }
}

export default (Base: Class<Base>) => class extends Base {
  get http (): Class<HTTP> {
    let cmd = this
    return class DebugHTTP extends HTTP {
      headers = {
        'user-agent': `${cmd.config.name}/${cmd.config.version} node-${process.version}`
      }
      async request () {
        logRequest.bind(cmd)(this)
        await super.request()
        logResponse.bind(cmd)(this, this.body)
      }
    }
  }
}
