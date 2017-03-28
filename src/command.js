// @flow

import Output from './output'
import Parser, {type OutputFlags, type OutputArgs, type InputFlags} from './parser' // eslint-disable-line
import pjson from '../package.json'
import Config, {type ConfigOptions} from './config'
import type {Arg} from './arg'
import HTTP from './http'

export default class Command <Flags: InputFlags> extends Output {
  static topic: string
  static command: ?string
  static description: ?string
  static hidden: ?boolean
  static usage: ?string
  static help: ?string
  static aliases: string[] = []
  static variableArgs = false
  static flags: Flags
  static args: Arg[] = []
  static _version: pjson.version

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
  static async mock (argv: string[] = [], options: ConfigOptions | Config = {}, ...rest: void[]): Promise<this> {
    options.mock = true
    return this.run(argv, options)
  }

  /**
   * instantiate and run the command
   */
  static async run (argv: string[] = [], options: ConfigOptions | Config = {}, ...rest: void[]): Promise<this> {
    let config = new Config(options)
    let cmd = new this(config)
    cmd.argv = argv
    // if (this.flags.debug) this.config.debug = 1
    try {
      const args = await cmd.parse()
      await cmd.run(args)
      await cmd.done()
    } catch (err) {
      if (config.mock) throw err
      cmd.error(err)
    }
    return cmd
  }

  http = new HTTP(this)

  flags: OutputFlags<Flags> = {}
  argv: string[]

  async parse () {
    const parser = new Parser({
      flags: this.constructor.flags || {},
      args: this.constructor.args || [],
      variableArgs: this.constructor.variableArgs,
      cmd: this
    })
    const {argv, flags} = await parser.parse({flags: this.flags, argv: this.argv})
    this.flags = flags
    this.argv = argv
  }

  // prevent setting things that need to be static
  topic: null
  command: null
  description: null
  hidden: null
  usage: null
  help: null
  aliases: null

  /**
   * actual command run code goes here
   */
  async run (...rest: void[]): Promise<void> { }
}
