// @flow

import Base from './base'
import Parser from './parser'
import pjson from '../package.json'
import Config from './config'
import type {Flag} from './flag'
import type {Arg} from './arg'
import {validate} from 'jest-validate'

const BUILTIN_FLAGS: Flag[] = [
  {name: 'debug', hidden: true},
  {name: 'no-color', hidden: true}
]

type RunOptions = {
  mock?: boolean,
  config?: Config
}

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

  static get flags (): Flag[] { return this._flags.concat(BUILTIN_FLAGS) }
  static set flags (flags: Flag[]) { this._flags = flags }

  static get args () { return this._args }
  static set args (args: Arg[]) { this._args = args }

  static async run (argv: string[] = [], options: RunOptions = {}): Promise<this> {
    let config = options.config || new Config()
    if (options.mock) config.mock = true
    let cmd = new this(config)
    cmd.argv = argv
    cmd.validate()
    try {
      await cmd.init()
      await cmd.run()
      await cmd.done()
    } catch (err) {
      if (config.mock) throw err
      cmd.error(err)
    }
    return cmd
  }

  // prevent setting things that need to be static
  topic: null
  command: null
  description: null
  hidden: null
  usage: null
  help: null
  aliases: null

  argv: string[]
  flags: {[flag: string]: string | true}
  args: {[arg: string]: string}

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

  async init () {
    await super.init()
    let parser = new Parser(this)
    await parser.parse()
    this.flags = parser.flags
    this.args = parser.args
    this.argv = parser.argv
    if (this.flags.debug) this.config.debug = 1
  }

  /**
   * actual command run code goes here
   */
  async run () { }

  async done () {
    await super.done()
  }
}
