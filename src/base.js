// @flow

import output from './output'

export type Config = {
  name: string,
  version: string
}

export default class Base extends output(class {}) {
  config: Config

  constructor (config: Config) {
    super(config)
    this.config = config
  }

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
