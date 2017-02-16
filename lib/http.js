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

      function requestMiddleware (options) {
        this.error(`--> ${options.method} ${options.host}${options.path}`)
        this.error(renderHeaders(options.headers))
        // if (body) console.error(`--- BODY\n${util.inspect(body)}\n---`)
      }

      function responseMiddleware ({response, body}) {
        let url = `${response.req._headers.host}${response.req.path}`
        console.error(`<-- ${response.req.method} ${url} ${response.statusCode}`)
        console.error(renderHeaders(response.headers))
        console.error(`--- BODY\n${util.inspect(body)}\n---`)
      }

      this[http] = new HTTP({
        requestMiddleware: requestMiddleware.bind(this),
        responseMiddleware: responseMiddleware.bind(this),
        headers: {
          'User-Agent': `heroku-cli/${this.options.version}`
        }
      })
      return this[http]
    }
  }
}
