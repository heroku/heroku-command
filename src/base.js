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

  /**
   * get whether or not command is in debug mode
   * @returns {number} - 0 if not debugging, otherwise current debug level (1 or 2 usually)
   */
  get debugging (): number {
    if (this.flags && this.flags.debug) return 1
    const HEROKU_DEBUG = process.env.HEROKU_DEBUG
    if (HEROKU_DEBUG === 'true') return 1
    if (HEROKU_DEBUG) return parseInt(HEROKU_DEBUG)
    return 0
  }

}
