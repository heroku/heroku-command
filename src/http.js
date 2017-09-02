// @flow

import httpCall, {type HTTPRequestOptions} from 'http-call'
import {buildConfig, type Config} from 'cli-engine-config'

export default class HTTP {
  config: Config
  http: Class<httpCall>
  requestOptions: HTTPRequestOptions

  constructor (config: ?Config) {
    this.config = config || buildConfig()
  }
  get (url: string, options: HTTPRequestOptions = {}) {
    return this.http.get(url, options)
  }
  post (url: string, options: HTTPRequestOptions = {}) {
    return this.http.post(url, options)
  }
  put (url: string, options: HTTPRequestOptions = {}) {
    return this.http.put(url, options)
  }
  patch (url: string, options: HTTPRequestOptions = {}) {
    return this.http.patch(url, options)
  }
  delete (url: string, options: HTTPRequestOptions = {}) {
    return this.http.delete(url, options)
  }
  stream (url: string, options: HTTPRequestOptions = {}) {
    return this.http.stream(url, options)
  }
  request (url: string, options: HTTPRequestOptions = {}) {
    return this.http.request(url, options)
  }
}
