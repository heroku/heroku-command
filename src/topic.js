// @flow
/* globals
   Class
 */

import {stdtermwidth} from './output/screen'
import Output from './output'
import type Command from './command'
import type {Config} from './config'
import type {Arg} from './arg'
import type {Flag} from './flag'

class Topic extends Output {
  constructor (commands: Class<Command>[], config: Config) {
    super(config)
    this.commands = commands
    this.argv0 = config.argv0
  }

  static topic: string

  commands: Class<Command>[]
  argv0: string

  async help (args: string[], matchedCommand: Class<Command>) {
    if (matchedCommand) this.commandHelp(matchedCommand)
    if (this.constructor.topic === args[0]) this.listCommandsHelp()
  }

  listCommandsHelp () {
    let commands = this.commands.filter(c => !c.hidden).map(c => [this.usage(c), c.description])
    if (commands.length === 0) return
    this.log(`${this.argv0} ${this.constructor.topic} commands: (${this.color.cmd(this.argv0 + ' help ' + this.constructor.topic + ':COMMAND')} for details)\n`)
    this.log(this.renderList(commands))
    this.log()
  }

  commandHelp (command: Class<Command>) {
    let usage = `${this.argv0} ${this.usage(command)}`
    this.log(`Usage: ${this.color.cmd(usage)}\n`)
    if (command.description) this.log(`${command.description.trim()}\n`)
    let flags = (command.flags || []).filter(f => !f.hidden)
    if (flags.length) this.log(`${this.renderFlags(flags)}\n`)
    if (command.help) this.log(`${command.help.trim()}\n`)
  }

  renderArg (arg: Arg) {
    let name = arg.name.toUpperCase()
    if (arg.required !== false && arg.optional !== true) return `${name}`
    else return `[${name}]`
  }

  renderFlags (flags: Flag[]) {
    flags.sort((a, b) => {
      if (a.char && !b.char) return -1
      if (b.char && !a.char) return 1
      if (a.name < b.name) return -1
      if (b.name < a.name) return 1
      return 0
    })
    return this.renderList(flags.map(f => {
      let label = []
      if (f.char) label.push(`-${f.char}`)
      if (f.name) label.push(` --${f.name}`)
      let usage = f.hasValue ? ` ${f.name.toUpperCase()}` : ''
      let description = f.description || ''
      if (f.required || f.optional === false) description = `(required) ${description}`
      return [label.join(',').trim() + usage, description]
    }))
  }

  usage (command: Class<Command>) {
    if (command.usage) return command.usage
    let cmd = command.command ? `${command.topic}:${command.command}` : command.topic
    if (!command.args) return cmd
    let args = command.args.map(this.renderArg)
    return `${cmd} ${args.join(' ')}`
  }

  renderList (items: [string, ?string][]): string {
    const S = require('string')
    const max = require('lodash.maxby')

    let maxLength = max(items, '[0].length')[0].length + 1
    let lines = items
      .map(i => [
        // left side
        ` ${S(i[0]).padRight(maxLength)}`,

        // right side
        i[1] ? this.linewrap(maxLength + 4, i[1]) : ''
      ])
      // join left + right side
      .map(i => i[1] ? `${i[0]} # ${i[1]}` : i[0])
    return lines.join('\n')
  }

  linewrap (length: number, s: string) {
    const linewrap = require('./output/linewrap')
    return linewrap(length, stdtermwidth, {
      skipScheme: 'ansi-color'
    })(s).trim()
  }
}

module.exports = Topic
