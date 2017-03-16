// @flow

import Output from './output'
import Parser from './parser'
import pjson from '../package.json'
import Config, {type ConfigOptions} from './config'
import type {Flag} from './flag'
import type {Arg} from './arg'
import {validate} from 'jest-validate'
import HTTP from './http'

export default class Command extends Output {
  static topic: string
  static command: ?string
  static description: ?string
  static hidden: ?boolean
  static usage: ?string
  static help: ?string
  static aliases: string[] = []
  static variableArgs = false
  static flags: Flag[] = []
  static args: Arg[] = []
  static _version: pjson.version
  static parser = Parser

  static _flags: Flag[] = [
    {name: 'debug', hidden: true},
    {name: 'no-color', hidden: true}
  ]

  static get id () {
    return this.command ? `${this.topic}:${this.command}` : this.topic
  }

  static async run (argv: string[] = [], options: ConfigOptions | Config = {}): Promise<this> {
    let config = new Config(options)
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

  http = new HTTP(this)

  argv: string[]
  flags: {[flag: string]: string}
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
        parser: Parser,
        _flags: [exampleFlag]
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
    const Parser = this.constructor.parser
    let parser = new Parser({
      flags: this.constructor.flags,
      args: this.constructor.args,
      variableArgs: this.constructor.variableArgs
    })
    let {flags, args, argv} = await parser.parse(...this.argv)
    this.flags = flags
    this.args = args
    this.argv = argv
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
