// @flow
/* globals
   Class
 */

import {stdtermwidth} from './output/screen'
import type Output from './output'
import type Command from './command'
import type {Arg} from './arg'
import type {Flag} from './flag'

class Topic {
  constructor (commands: Class<Command>[], out: Output) {
    this.out = out
    this.commands = commands
  }

  static topic: string
  static description: ?string
  static hidden = false

  commands: Class<Command>[]
  out: Output

  async help (args: string[], matchedCommand?: ?Class<Command>) {
    if (matchedCommand) this.commandHelp(matchedCommand)
    if (this.constructor.topic === args[0]) this.listCommandsHelp()
  }

  listCommandsHelp () {
    let commands = this.commands.filter(c => !c.hidden).map(c => [this.usage(c), c.description])
    if (commands.length === 0) return
    this.out.log(`${this.out.config.bin} ${this.constructor.topic} commands: (${this.out.color.cmd(this.out.config.bin + ' help ' + this.constructor.topic + ':COMMAND')} for details)\n`)
    this.out.log(this.renderList(commands))
    this.out.log()
  }

  commandHelp (command: Class<Command>) {
    let usage = `${this.out.config.bin} ${this.usage(command)}`
    this.out.log(`Usage: ${this.out.color.cmd(usage)}\n`)
    if (command.description) this.out.log(`${command.description.trim()}\n`)
    let flags = (command.flags || []).filter(f => !f.hidden)
    if (flags.length) this.out.log(`${this.renderFlags(flags)}\n`)
    if (command.help) this.out.log(`${command.help.trim()}\n`)
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
    if (command.usage) return command.usage.trim()
    let cmd = command.command ? `${command.topic}:${command.command}` : command.topic
    if (!command.args) return cmd.trim()
    let args = command.args.map(this.renderArg)
    return `${cmd} ${args.join(' ')}`.trim()
  }

  renderList (items: [string, ?string][]): string {
    const S = require('string')
    const max = require('lodash.maxby')

    let maxLength = max(items, '[0].length')[0].length + 1
    let lines = items
      .map(i => {
        let left = ` ${i[0]}`
        let right = i[1]
        if (!right) return left
        left = `${S(left).padRight(maxLength)}`
        right = this.linewrap(maxLength + 4, right)
        return `${left} # ${right}`
      })
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
