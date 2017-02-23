// @flow

import Base from './base'
import Parser from './parser'
import pjson from '../package.json'
import {type ConfigOptions} from './config'
import type {Flag} from './flag'
import type {Arg} from './arg'
import {validate} from 'jest-validate'

export default class Command extends Base {
  static topic: string
  static command: ?string
  static description: ?string
  static hidden: ?boolean
  static usage: ?string
  static help: ?string
  static aliases: string[] = []

  static _version: pjson.version

  static _flags: Flag[] = []
  static __flags: Flag[] = [
    {name: 'debug', hidden: true},
    {name: 'no-color', hidden: true}
  ]

  static _args: Arg[] = []
  static __args: Arg[] = []

  static get id () {
    return this.command ? `${this.topic}:${this.command}` : this.topic
  }

  static get flags () { return this.__flags.concat(this._flags) }
  static set flags (flags: Flag[]) { this._flags = flags }

  static get args () { return this.__args.concat(this._args) }
  static set args (args: Arg[]) { this._args = args }

  constructor (config: ConfigOptions = {}) {
    super(config)
    this.validate()
    this.argv = this.config.argv
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
    await this.parser.parse()
    await super.init()
    this.flags = this.parser.flags
    this.args = this.parser.args
  }

  validate () {
    validate({
      topic: this.constructor.topic,
      command: this.constructor.command,
      description: this.constructor.description,
      hidden: this.constructor.hidden,
      usage: this.constructor.usage,
      help: this.constructor.help,
      aliases: this.constructor.aliases
    }, {
      exampleConfig: {
        topic: 'apps',
        command: 'info',
        description: 'description of my command',
        hidden: true,
        usage: 'how to use the command',
        help: 'long form help text',
        aliases: ['-v', '--version']
      }
    })
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
