const screen = require('./screen')
const mixins = require('./mixins')
const color = require('./color')
const output = require('./output')

class Topic extends mixins.mix(Object).with(color(), output()) {
  constructor (options) {
    super(options)
    this.flags = options.flags
  }

  async help ({argv0, commands, args, matchedCommand}) {
    if (matchedCommand) this.commandHelp(matchedCommand)
    let topic = this.constructor.name.toLowerCase()
    if (topic === args[0]) this.listCommandsHelp({commands, argv0, topic})
  }

  commandHelp (command) {
    let cmd = command.command ? `${command.topic}:${command.command}` : command.topic
    // TODO: get usage if defined
    let usage = `${this.argv0} ${cmd}` + (command.args || []).map(this.renderArg).join('')
    this.log(`Usage: ${this.color.cmd(usage)}\n`)
    if (command.description) this.log(`${command.description.trim()}\n`)
    let flags = (command.flags || []).filter(f => !f.hidden)
    if (flags.length) this.log(`${this.renderFlags(flags)}\n`)
    if (command.help) this.log(`${command.help.trim()}\n`)
  }

  listCommandsHelp ({commands, argv0, topic}) {
    const max = require('lodash.maxby')
    const S = require('string')

    if (commands.length === 0) return
    this.log(`${argv0} ${topic} commands: (${this.color.cmd(argv0 + ' help ' + topic + ':COMMAND')} for details)
  `)
    let maxLength = max(commands, 'command.length').command.length + topic.length + 1
    for (let command of commands) {
      let cmd = command.command ? `${command.topic}:${command.command}` : command.topic
      this.log(`  ${S(cmd).padRight(maxLength)}${command.description ? ' # ' + command.description : ''}`)
    }
    this.log()
  }

  renderArg (arg) {
    if (arg.required !== false && arg.optional !== true) return ` <${arg.name}>`
    else return ` [${arg.name}]`
  }

  renderFlags (flags) {
    const linewrap = require('../lib/linewrap')
    const max = require('lodash.maxby')
    const S = require('string')

    let lines = []
    for (let flag of flags) {
      let label = []
      if (flag.char) label.push(`-${flag.char}`)
      if (flag.name) label.push(` --${flag.name}`)
      let usage = flag.hasValue ? ` ${flag.name.toUpperCase()}` : ''
      let description = flag.description || ''
      if (flag.required || flag.optional === false) description = `(required) ${description}`
      lines.push([label.join(',').trim() + usage, description])
    }
    let maxLength = max(lines, '0')[0].length
    return lines.map(line => {
      let desc = line[1] || ''
      if (desc) {
        desc = linewrap(maxLength + 4, screen.errtermwidth(), {
          skipScheme: 'ansi-color'
        })(desc).trim()
        desc = ' # ' + desc.split('\n').map(l => {
          if (l[0] !== ' ') return l
          return l.substr(0, maxLength + 1) + ' # ' + l.substr(maxLength + 4)
        }).join('\n')
      }
      return ` ${S(line[0]).padRight(maxLength)}${desc}`
    }).join('\n')
  }
}

module.exports = Topic
