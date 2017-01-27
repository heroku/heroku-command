'use strict'

const Command = require('./command')
const mixins = require('./mixins')

module.exports = command => {
  class NewCommand extends Command {
    async run () {
      this.auth = {password: this.auth}
      await command.run(this)
    }
  }
  NewCommand.topic = command.topic
  NewCommand.command = command.command
  NewCommand.description = command.description
  NewCommand.args = command.args
  NewCommand.variableArgs = command.variableArgs
  NewCommand.flags = command.flags
  NewCommand.mixins = []
  if (command.needsAuth) mixins.auth(NewCommand)
  if (command.needsApp) mixins.app(NewCommand)
  return NewCommand
}
