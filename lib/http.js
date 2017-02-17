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
      const HTTP = require('http-call')

      this[http] = new HTTP({
        requestMiddleware: module.exports.requestMiddleware.bind(this),
        responseMiddleware: module.exports.responseMiddleware.bind(this),
        headers: {
          'user-agent': `heroku-cli/${this.options.version}`
        }
      })
      return this[http]
    }
  }
}

module.exports.requestMiddleware = function (options) {
  if (!this.debugging) return
  this.error(`--> ${options.method} ${options.host}${options.path}`)
  if (this.debugging > 1) {
    this.error(renderHeaders(options.headers))
    // if (body) this.error(`--- BODY\n${util.inspect(body)}\n---`)
  }
}

module.exports.responseMiddleware = function ({response, body, options}) {
  if (!this.debugging) return
  let url = `${response.req._headers.host}${response.req.path}`
  this.error(`<-- ${response.req.method} ${url} ${response.statusCode}`)
  if (this.debugging > 1) {
    this.error(renderHeaders(response.headers))
    if (!options.raw) this.error(`--- BODY\n${util.inspect(body)}\n---`)
  }
}
