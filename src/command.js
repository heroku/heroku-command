// @flow

import Base from './base'
import Parser from './parser'
import pjson from '../package.json'
import {type ConfigOptions} from './config'
import type {Flag} from './flag'
import type {Arg} from './arg'

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

  /**
   * actual command run code goes here
   */
  async run () {
    throw new Error('must implement abstract class Command')
  }

  async done () {
    await super.done()
  }
}
