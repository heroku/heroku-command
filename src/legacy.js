// @flow

import Command from './command'
import mixins from './mixins'
import type {Flag} from './flag'
import type {Arg} from './arg'

const api = superclass => class extends superclass {
  auth: {password: string}

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

type LegacyCommand = {
  topic: string,
  command?: string,
  description?: string,
  args: Arg[],
  flags: Flag[],
  needsAuth?: boolean,
  needsApp?: boolean,
  run: Function
}

export default (command: LegacyCommand) => {
  let BaseCommand = Command
  if (command.needsApp) BaseCommand = mixins.app(BaseCommand)
  if (command.needsAuth) BaseCommand = api(BaseCommand)
  class NewCommand extends BaseCommand {
    async run () {
      const ctx = new Proxy(this, { get: (ctx: any, name) => {
        if (name === 'debug') return ctx.debugging
        return ctx[name]
      }})
      await command.run(ctx)
    }
  }
  NewCommand.topic = command.topic
  NewCommand.command = command.command
  NewCommand.description = command.description
  NewCommand.args = command.args
  NewCommand.flags = command.flags
  // TODO: variableArgs
  // NewCommand.variableArgs = command.variableArgs
  return NewCommand
}
