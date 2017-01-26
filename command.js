'use strict'

const parse = require('./parse')
const slack = require('./slack')

class Command {
  constructor (options = {}) {
    this.argv = options.argv
    this.slack = options.slack
    this.constructor.mixins = this.constructor.mixins || []
    this.constructor.flags = this.constructor.flags || []
    this.constructor._init = this.constructor._init || []
    for (let mixin of this.constructor.mixins) mixin.call(this)
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
      if (!this._output) this._output = []
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
}

module.exports = Command
