'use strict'

const mixins = require('./mixins')
const color = require('./color')
const output = require('./output')
const parse = require('./parse')
const _flags = Symbol('flags')
const _args = Symbol('args')

class Command extends mixins.mix(Object).with(color(), output(), parse()) {
  constructor (options = {}) {
    super()
    this.argv = options.argv
    this.slack = options.slack
    this._output = ''
  }

  run () {
    throw new Error('must implement abstract class Command')
  }

  async done () {
    if (this.slack) {
      const slack = require('./slack')
      slack.respond({
        text: `\`/heroku ${this.slack.text}\``,
        attachments: [
          {
            text: '```' + this._output + '```',
            mrkdwn_in: ['text']
          }
        ]
      }, this.slack)
    }
  }

  get debug () {
    if (this.flags.debug) return this.flags.debug
    if (['true', '1'].indexOf((process.env.HEROKU_DEBUG || '').toLowerCase()) !== -1) return 1
    return 0
  }

  static get flags () {
    if (!this[_flags]) this[_flags] = []
    return this[_flags]
  }

  static set flags (flags) {
    if (!this[_flags]) this[_flags] = []
    this[_flags] = this[_flags].concat(flags)
  }

  static get args () {
    if (!this[_args]) this[_args] = []
    return this[_args]
  }

  static set args (args) {
    if (!this[_args]) this[_args] = []
    this[_args] = this[_args].concat(args)
  }
}

Command._version = require('../package.json').version

module.exports = Command
