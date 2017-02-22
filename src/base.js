// @flow
/* globals
   Class
*/

import Output from './output'
import Config, {type ConfigOptions} from './config'
import http from './http'
import type HTTP from 'http-call'

export default class Base extends Output {
  constructor (options: ConfigOptions) {
    super(options)
    this.http = http(this)
  }

  config: Config
  http: Class<HTTP>
}
