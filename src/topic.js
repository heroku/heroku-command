const screen = require('./screen')

import Base from './base'
import color from './color'
import output from './output'

class Topic extends color(output(Base)) {
  constructor (options) {
    super(options)
    this.commands = options.commands
    this.flags = options.flags
  }

  async help ({argv0, commands, args, matchedCommand}) {
    if (matchedCommand) this.commandHelp({command: matchedCommand, argv0})
    if (this.constructor.topic === args[0]) this.listCommandsHelp({commands, argv0})
  }

  listCommandsHelp ({argv0}) {
    let commands = this.commands.filter(c => !c.hidden).map(c => [this.usage(c), c.description])
    if (commands.length === 0) return
    this.log(`${argv0} ${this.constructor.topic} commands: (${this.color.cmd(argv0 + ' help ' + this.constructor.topic + ':COMMAND')} for details)\n`)
    this.log(this.renderList(commands))
    this.log()
  }

  commandHelp ({argv0, command}) {
    let usage = `${argv0} ${this.usage(command)}`
    this.log(`Usage: ${this.color.cmd(usage)}\n`)
    if (command.description) this.log(`${command.description.trim()}\n`)
    let flags = (command.flags || []).filter(f => !f.hidden)
    if (flags.length) this.log(`${this.renderFlags(flags)}\n`)
    if (command.help) this.log(`${command.help.trim()}\n`)
  }

  renderArg (arg) {
    let name = arg.name.toUpperCase()
    if (arg.required !== false && arg.optional !== true) return `${name}`
    else return `[${name}]`
  }

  renderFlags (flags) {
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

  usage (command) {
    if (command.usage) return command.usage
    let cmd = command.command ? `${command.topic}:${command.command}` : command.topic
    if (!command.args) return cmd
    let args = command.args.map(this.renderArg)
    return `${cmd} ${args.join(' ')}`
  }

  renderList (items) {
    const S = require('string')
    const max = require('lodash.maxby')

    let maxLength = max(items, '[0].length')[0].length + 1
    let lines = items
      .map(i => [
        // left side
        ` ${S(i[0]).padRight(maxLength)}`,

        // right side
        this.linewrap(maxLength + 4, i[1])
      ])
      // join left + right side
      .map(i => i[1] ? `${i[0]} # ${i[1]}` : i[0])
    return lines.join('\n')
  }

  linewrap (length, s) {
    const linewrap = require('../lib/linewrap')
    return linewrap(length, screen.stdtermwidth, {
      skipScheme: 'ansi-color'
    })(s).trim()
  }
}

module.exports = Topic
