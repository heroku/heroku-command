// @flow

import Output from './output'
import Config from './config'
import http from './http'
import type HTTP from 'http-call'

export default class Base extends Output {
  constructor (options: Config) {
    super(options)
    this.http = http(this)
  }

  http: Class<HTTP>
}
