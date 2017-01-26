'use strict'

const parse = require('./parse')
const slack = require('./slack')
const util = require('util')

class Command {
  constructor (options = {}) {
    this.argv = options.argv
    this.slack = options.slack
    this.constructor.mixins = this.constructor.mixins || []
    this.constructor.flags = this.constructor.flags || []
    this.constructor._init = this.constructor._init || []
    for (let mixin of this.constructor.mixins) mixin.call(this)
    this._output = []
  }

  async init () {
    await parse.call(this)
    for (let init of this.constructor._init) await init.call(this)
  }

  async done () {
    if (this.slack) {
      slack.respond({
        text: `\`/heroku ${this.slack.text}\``,
        attachments: [
          {
            text: '```' + this._output.join('\n') + '```',
            mrkdwn_in: ['text']
          }
        ]
      }, this.slack)
    }
  }

  get supportsColor () {
    if (this.slack) return false
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

  log (...args) {
    if (this.slack) {
      this._output.push(...args)
    } else {
      console.log(...args)
    }
  }

  styledJSON (obj) {
    let json = JSON.stringify(obj, null, 2)
    if (this.supportsColor) {
      let cardinal = require('cardinal')
      let theme = require('cardinal/themes/jq')
      this.log(cardinal.highlight(json, {json: true, theme: theme}))
    } else {
      this.log(json)
    }
  }

  styledHeader (header) {
    this.log(this.color.gray('=== ') + this.color.bold(header))
  }

  styledObject (obj, keys) {
    let keyLengths = Object.keys(obj).map(key => key.toString().length)
    let maxKeyLength = Math.max.apply(Math, keyLengths) + 2
    function pp (obj) {
      if (typeof obj === 'string' || typeof obj === 'number') {
        return obj
      } else if (typeof obj === 'object') {
        return Object.keys(obj).map(k => k + ': ' + util.inspect(obj[k])).join(', ')
      } else {
        return util.inspect(obj)
      }
    }
    let logKeyValue = (key, value) => {
      this.log(`${key}:` + ' '.repeat(maxKeyLength - key.length - 1) + pp(value))
    }
    for (var key of (keys || Object.keys(obj).sort())) {
      let value = obj[key]
      if (Array.isArray(value)) {
        if (value.length > 0) {
          logKeyValue(key, value[0])
          for (var e of value.slice(1)) {
            this.log(' '.repeat(maxKeyLength) + pp(e))
          }
        }
      } else if (value !== null && value !== undefined) {
        logKeyValue(key, value)
      }
    }
  }

  get color () {
    if (this._color) return this._color

    this._color = require('chalk')
    this._color.enabled = this.supportsColor

    this._color.attachment = s => this._color.cyan(s)
    this._color.addon = s => this._color.yellow(s)
    this._color.configVar = s => this._color.green(s)
    this._color.release = s => this._color.blue.bold(s)
    this._color.cmd = s => this._color.cyan.bold(s)

    this._color.heroku = s => {
      if (!this.supportsColor) return s
      let supports = require('supports-color')
      if (!supports) return s
      supports.has256 = supports.has256 || (process.env.TERM || '').indexOf('256') !== -1
      return supports.has256 ? '\u001b[38;5;104m' + s + this._color.styles.modifiers.reset.open : this._color.magenta(s)
    }

    this._color.app = s => this.supportsColor && process.platform !== 'win32' ? this._color.heroku(`⬢ ${s}`) : this._color.heroku(s)

    return this._color
  }
}

module.exports = Command
