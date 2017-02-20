'use strict'

const Command = require('./command')
const mixins = require('./mixins')
const app = require('./mixins/app')

const api = superclass => class extends superclass {
  async init () {
    await super.init()
    let password = process.env.HEROKU_API_KEY
    if (!password) {
      const netrc = require('netrc')()
      const host = netrc['api.heroku.com']
      if (host) password = host.password
    }
    if (!password) throw new Error('Not logged in')
    this.auth = {password}
  }
}

module.exports = command => {
  let BaseCommand = Command
  if (command.needsApp) BaseCommand = mixins.mix(BaseCommand).with(app())
  if (command.needsAuth) BaseCommand = mixins.mix(BaseCommand).with(api)
  class NewCommand extends BaseCommand {
    async run () {
      this.debug = this.debugging
      await command.run(this)
    }
  }
  NewCommand.topic = command.topic
  NewCommand.command = command.command
  NewCommand.description = command.description
  NewCommand.args = command.args
  NewCommand.variableArgs = command.variableArgs
  NewCommand.flags = command.flags
  return NewCommand
}
