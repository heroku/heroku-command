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
    let config = new Config(options)
    super(config.mock)
    this.config = config
    this.http = http(this)
  }

  config: Config
  http: Class<HTTP>
}
