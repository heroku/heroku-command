'use strict'

const http = Symbol('http')
const util = require('util')

function renderHeaders (headers) {
  return Object.keys(headers).map(key => {
    let value = key.toUpperCase() === 'AUTHORIZATION' ? 'REDACTED' : headers[key]
    return '    ' + key + '=' + value
  }).join('\n')
}

module.exports = () => {
  return Base => class HTTP extends Base {
    get http () {
      if (this[http]) return this[http]
      const {default: HTTP} = require('http-call')

      let cmd = this
      this[http] = class extends HTTP {
        // 'user-agent' = `${this.config.name}/${this.config.version}`
        async request () {
          module.exports.logRequest.bind(cmd)(this)
          await super.request()
          module.exports.logResponse.bind(cmd)(this, this.body)
        }
      }
      return this[http]
    }
  }
}

module.exports.logRequest = function (http) {
  if (!this.debugging) return
  this.error(`--> ${http.method} ${http.url}`)
  if (this.debugging > 1) {
    this.error(renderHeaders(http.headers))
    // if (body) this.error(`--- BODY\n${util.inspect(body)}\n---`)
  }
}

module.exports.logResponse = function (http, response) {
  if (!this.debugging) return
  this.error(`<-- ${http.method} ${http.url} ${http.response.statusCode}`)
  if (this.debugging > 1) {
    this.error(renderHeaders(http.response.headers))
    this.error(`--- BODY\n${util.inspect(response)}\n---`)
  }
}
