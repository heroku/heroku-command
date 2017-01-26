'use strict'

const parse = require('./parse')

class Command {
  constructor (options = {}) {
    this.argv = options.argv
    this.constructor.mixins = this.constructor.mixins || []
    this.constructor.flags = this.constructor.flags || []
    this.constructor._init = this.constructor._init || []
    for (let mixin of this.constructor.mixins) mixin.call(this)
  }

  async init () {
    await parse.call(this)
    for (let init of this.constructor._init) await init.call(this)
  }

  get supportsColor () {
    if (['false', '0'].indexOf((process.env.COLOR || '').toLowerCase()) !== -1) return false
    if ((process.env.TERM.toLowerCase() || '') === 'dumb') return false
    if (this.flags['no-color']) return false
    // TODO: check config file
    return true
  }

  get debug () {
    if (this.flags.debug) return this.flags.debug
    if (['true', '1'].indexOf((process.env.HEROKU_DEBUG || '').toLowerCase()) !== -1) return 1
    return 0
  }
}

module.exports = Command
