'use strict'

class Command {
  constructor (options = {}) {
    this.argv = options.argv
    this.slack = options.slack
    this.constructor.args = this.constructor.args || []
    this.constructor.flags = this.constructor.flags || []
    this.constructor.prepare = this.constructor.prepare || []
    this._output = []
  }

  async init () {
    await require('./color').call(this)
    await require('./output').call(this)
    await require('./parse').call(this)
    for (let prepare of this.constructor.prepare) await prepare.call(this)
  }

  async done () {
    if (this.slack) {
      const slack = require('./slack')
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

  get debug () {
    if (this.flags.debug) return this.flags.debug
    if (['true', '1'].indexOf((process.env.HEROKU_DEBUG || '').toLowerCase()) !== -1) return 1
    return 0
  }
}

Command._version = require('../package.json').version

module.exports = Command
