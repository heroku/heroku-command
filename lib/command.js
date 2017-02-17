'use strict'

const mixins = require('./mixins')
const color = require('./color')
const output = require('./output')
const parse = require('./parse')
const http = require('./http')
const _flags = Symbol('flags')
const _args = Symbol('args')

class Command extends mixins.mix(Object).with(color(), output(), parse(), http()) {
  constructor (options = {}) {
    super(options)
    this.options = options
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

  /**
   * get whether or not command is in debug mode
   * @returns {number} - 0 if not debugging, otherwise current debug level (1 or 2 usually)
   */
  get debugging () {
    if (this.flags && this.flags.debug) return this.flags.debug
    if (['true', '1'].indexOf((process.env.HEROKU_DEBUG || '').toLowerCase()) !== -1) return 1
    return 0
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
Command.flags = [{name: 'debug', char: 'd', hidden: true}]

module.exports = Command
