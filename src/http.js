// @flow

import util from 'util'
import httpCall, {type RequestOptions} from 'http-call'
import type Output from './output'

function mergeRequestOptions (...options: $Shape<RequestOptions>[]): RequestOptions {
  let output: RequestOptions = {method: 'GET', headers: {}}
  for (let o of options) {
    let headers = Object.assign(output.headers, o.headers)
    Object.assign(output, o)
    output.headers = headers
  }
  return output
}

function renderHeaders (headers: {[key: string]: string}) {
  return Object.keys(headers).map(key => {
    let value = key.toUpperCase() === 'AUTHORIZATION' ? 'REDACTED' : headers[key]
    return '    ' + key + '=' + value
  }).join('\n')
}

export default class HTTP {
  out: Output
  http: Class<httpCall>
  requestOptions: RequestOptions

  constructor (output: Output) {
    let self = this
    this.out = output
    this.requestOptions = mergeRequestOptions({
      headers: {
        'user-agent': `${this.out.config.name}/${this.out.config.version} node-${process.version}`
      }
    })
    this.http = class extends httpCall {
      async request () {
        self._logRequest(this)
        await super.request()
        self._logResponse(this)
      }
    }
  }

  get (url: string, options: $Shape<RequestOptions> = {}) {
    options = mergeRequestOptions(this.requestOptions, options)
    return this.http.get(url, options)
  }
  post (url: string, options: $Shape<RequestOptions> = {}) {
    options = mergeRequestOptions(this.requestOptions, options)
    return this.http.post(url, options)
  }

  stream (url: string, options: $Shape<RequestOptions> = {}) {
    options = mergeRequestOptions(this.requestOptions, options)
    return this.http.stream(url, options)
  }

  _logRequest (http: httpCall) {
    if (!this.out.config.debug) return
    this.out.stderr.log(`--> ${http.method} ${http.url}`)
    if (this.out.config.debug > 1) {
      this.out.stderr.log(renderHeaders(http.headers))
      // if (body) this.error(`--- BODY\n${util.inspect(body)}\n---`)
    }
  }

  _logResponse (http: httpCall) {
    if (!this.out.config.debug) return
    this.out.stderr.log(`<-- ${http.method} ${http.url} ${http.response.statusCode}`)
    if (this.out.config.debug > 1) {
      this.out.stderr.log(renderHeaders(http.response.headers))
      if (http.body) this.out.stderr.log(`--- BODY\n${util.inspect(http.body)}\n---`)
    }
  }
}
