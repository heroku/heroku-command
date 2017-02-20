const _flags = Symbol('flags')
const _args = Symbol('args')

import Base from './base'
import http from './http'
import color from './color'
import output from './output'
import parse from './parse'

class Command extends color(output(parse(http(Base)))) {
  constructor (options = {}) {
    super(options)
    this.options = options
    this.config = options.config
    this.argv = options.argv
  }

  /**
   * actual command run code goes here
   */
  async run () {
    throw new Error('must implement abstract class Command')
  }

  async done () {
    await super.done()
  }

  static get id () {
    return this.command ? `${this.topic}:${this.command}` : this.topic
  }

  static get flags () {
    if (!this[_flags]) this[_flags] = []
    return this[_flags]
  }

  static set flags (flags) {
    if (!this[_flags]) this[_flags] = []
    if (!flags) return
    this[_flags] = this[_flags].concat(flags)
  }

  static get args () {
    if (!this[_args]) this[_args] = []
    return this[_args]
  }

  static set args (args) {
    if (!this[_args]) this[_args] = []
    if (!args) return
    this[_args] = this[_args].concat(args)
  }
}

Command._version = require('../package.json').version
Command.flags = [
  {name: 'debug', hidden: true},
  {name: 'no-color', hidden: true}
]

export default Command
