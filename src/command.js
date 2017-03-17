// @flow

import Output from './output'
import Parser, {type ArgsOutput} from './parser'
import pjson from '../package.json'
import Config, {type ConfigOptions} from './config'
import type {Flag} from './flag'
import type {Arg} from './arg'
import HTTP from './http'

type Flags <T> = {[name: string]: T}

type RunOptions <TFlag> = {
  flags: Flags<TFlag>,
  args: {+[name: string]: string},
  argv: string[]
}

export default class Command <TFlag: Flag> extends Output {
  static topic: string
  static command: ?string
  static description: ?string
  static hidden: ?boolean
  static usage: ?string
  static help: ?string
  static aliases: string[] = []
  static variableArgs = false
  static flags: {[name: string]: Class<Flag>}
  static args: Arg[] = []
  static _version: pjson.version

  static flag: Class<TFlag>

  // static _flags: Flags = [
  //   {name: 'debug', hidden: true},
  //   {name: 'no-color', hidden: true}
  // ]

  static get id () {
    return this.command ? `${this.topic}:${this.command}` : this.topic
  }

  /**
   * instantiate and run the command setting {mock: true} in the config
   */
  static async mock (argv: string[] = [], options: ConfigOptions | Config = {}, ...rest: void[]) {
    options.mock = true
    return this.run(argv, options)
  }

  /**
   * instantiate and run the command
   */
  static async run (argv: string[] = [], options: ConfigOptions | Config = {}, ...rest: void[]): Promise<this> {
    let config = new Config(options)
    let cmd = new this(config)
    // if (this.flags.debug) this.config.debug = 1
    try {
      const args = await cmd.parse(...argv)
      await cmd.run(args)
      await cmd.done()
    } catch (err) {
      if (config.mock) throw err
      cmd.error(err)
    }
    return cmd
  }

  http = new HTTP(this)

  // prevent setting things that need to be static
  topic: null
  command: null
  description: null
  hidden: null
  usage: null
  help: null
  aliases: null

  async parse (...argv: string[]): Promise<ArgsOutput<TFlag>> {
    const parser = new Parser({
      flags: ({org: this.constructor.flag}: Flags<Class<TFlag>>),
      args: this.constructor.args,
      variableArgs: this.constructor.variableArgs
    })
    return await parser.parse(...argv)
  }

  /**
   * actual command run code goes here
   */
  async run (args: ArgsOutput<TFlag>, ...rest: void[]): Promise<void> { }
}
