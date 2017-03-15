// @flow

import util from 'util'
import httpCall, {type RequestOptions} from 'http-call'
import type Command from './command'

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
  cmd: Command
  http: Class<httpCall>
  requestOptions: RequestOptions

  logRequest (http: httpCall) {
    if (!this.cmd.config.debug) return
    this.cmd.stderr.log(`--> ${http.method} ${http.url}`)
    if (this.cmd.config.debug > 1) {
      this.cmd.stderr.log(renderHeaders(http.headers))
      // if (body) this.error(`--- BODY\n${util.inspect(body)}\n---`)
    }
  }

  logResponse (http: httpCall) {
    if (!this.cmd.config.debug) return
    this.cmd.stderr.log(`<-- ${http.method} ${http.url} ${http.response.statusCode}`)
    if (this.cmd.config.debug > 1) {
      this.cmd.stderr.log(renderHeaders(http.response.headers))
      if (http.body) this.cmd.stderr.log(`--- BODY\n${util.inspect(http.body)}\n---`)
    }
  }

  get (url: string, options: $Shape<RequestOptions> = {}) {
    options = mergeRequestOptions(this.requestOptions, options)
    return this.http.get(url, options)
  }

  constructor (cmd: Command) {
    let self = this
    this.cmd = cmd
    this.requestOptions = mergeRequestOptions({
      headers: {
        'user-agent': `${this.cmd.config.name}/${this.cmd.config.version} node-${process.version}`
      }
    })
    this.http = class extends httpCall {
      async request () {
        self.logRequest(this)
        await super.request()
        self.logResponse(this)
      }
    }
  }
}
