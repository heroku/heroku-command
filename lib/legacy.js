'use strict'

const Command = require('./command')

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
  if (command.needsAuth) NewCommand.mixins.push(require('./mixins/api')())
  if (command.needsApp) NewCommand.mixins.push(require('./mixins/app')())
  return NewCommand
}
