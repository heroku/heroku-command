// @flow

import Base from './base'
import Parser from './parser'
import pjson from '../package.json'
import {type ConfigOptions} from './config'
import type {Flag} from './flag'
import type {Arg} from './arg'
import {validate} from 'jest-validate'

const BUILTIN_FLAGS: Flag[] = [
  {name: 'debug', hidden: true},
  {name: 'no-color', hidden: true}
]

export default class Command extends Base {
  static topic: string
  static command: ?string
  static description: ?string
  static hidden: ?boolean
  static usage: ?string
  static help: ?string
  static aliases: string[] = []
  static variableArgs = false

  static _version: pjson.version

  static _flags: Flag[] = []

  static _args: Arg[] = []

  static get id () {
    return this.command ? `${this.topic}:${this.command}` : this.topic
  }

  static get flags () { return this._flags.concat(BUILTIN_FLAGS) }
  static set flags (flags: Flag[]) { this._flags = flags }

  static get args () { return this._args }
  static set args (args: Arg[]) { this._args = args }

  constructor (config: ConfigOptions = {}) {
    super(config)
    this.validate()
    this.argv = this.config.argv.slice(1)
    this.parser = new Parser(this)
  }

  // prevent setting things that need to be static
  topic: null
  command: null
  description: null
  hidden: null
  usage: null
  help: null
  aliases: null

  parser: Parser
  argv: string[]
  flags: {[flag: string]: string | true}
  args: {[arg: string]: string}

  async init () {
    await super.init()
    await this.parser.parse()
    this.flags = this.parser.flags
    this.args = this.parser.args
    this.argv = this.parser.argv
    if (this.flags.debug) this.config.debug = 1
  }

  validate () {
    const exampleFlag = {
      name: 'app',
      char: 'a',
      hidden: false,
      hasValue: false,
      required: false,
      optional: true,
      description: 'description of flag',
      parse: () => { },
      default: () => { }
    }
    const exampleArg = {
      name: 'FILE',
      required: true,
      optional: false,
      hidden: false
    }
    const id = this.constructor.id
    validate(this.constructor, {
      comment: `Command: ${id}`,
      exampleConfig: {
        topic: 'apps',
        command: 'info',
        description: 'description of my command',
        hidden: true,
        variableArgs: false,
        usage: 'how to use the command',
        help: 'long form help text',
        aliases: ['-v', '--version'],
        args: [exampleArg],
        flags: [exampleFlag],
        _args: [],
        _flags: [],
        __args: [],
        __flags: []
      }
    })
    for (let flag of this.constructor.flags) {
      validate(flag, {
        comment: `${id} flag: ${flag.name}`,
        exampleConfig: exampleFlag
      })
    }
    for (let arg of this.constructor.args) {
      validate(arg, {
        comment: `${id} arg: ${arg.name}`,
        exampleConfig: exampleArg
      })
    }
  }

  /**
   * actual command run code goes here
   */
  async run () {
    throw new Error('must implement run')
  }

  /**
   * runs init/run/done lifecycle
   */
  async _run () {
    await this.init()
    await this.run()
    await this.done()
  }

  async done () {
    await super.done()
  }
}
