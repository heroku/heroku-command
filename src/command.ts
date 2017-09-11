import { parse, OutputFlags, OutputArgs, InputFlags, InputArgs } from 'cli-flags'
import { buildConfig, Config, ConfigOptions, Plugin } from 'cli-engine-config'
import { HTTP } from 'http-call'
import Help from './help'
import { CLI } from 'cli-ux'
import { deprecate } from 'util'

const pjson = require('../package.json')

export default class Command {
  constructor: typeof Command // Explicitly declare constructor property

  static topic?: string
  static command?: string
  static description?: string
  static hidden?: boolean
  static usage?: string
  static help?: string
  static aliases: string[] = []
  static variableArgs = false
  static flags: InputFlags = {}
  static args: InputArgs = []
  static _version = pjson.version
  static plugin?: Plugin

  static get id(): string {
    let cmd = []
    if (this.topic) cmd.push(this.topic)
    if (this.command) cmd.push(this.command)
    return cmd.join(':')
  }

  /**
   * instantiate and run the command setting {mock: true} in the config (shorthand method)
   */
  static async mock(...argv: string[]): Promise<Command> {
    argv.unshift('argv0', 'cmd')
    return this.run({ argv, mock: true })
  }

  /**
   * instantiate and run the command
   */
  static async run(config?: ConfigOptions): Promise<Command> {
    const cmd = new this({ config })
    try {
      await cmd.init()
      await cmd.run()
      await cmd.out.done()
    } catch (err) {
      cmd.out.error(err)
    }
    return cmd
  }

  config: Config
  http: typeof HTTP
  cli: CLI
  flags: OutputFlags = {}
  argv: string[]
  args: { [name: string]: string } = {}

  constructor(options: { config?: ConfigOptions } = {}) {
    this.config = buildConfig(options.config)
    this.argv = this.config.argv
    const { CLI } = require('cli-ux')
    this.cli = new CLI({ mock: this.config.mock })
    this.http = HTTP.defaults({
      headers: {
        'user-agent': `${this.config.name}/${this.config.version} (${this.config.platform}-${this.config
          .arch}) node-${process.version}`,
      },
    })
  }

  get out() {
    deprecate(() => {}, 'this.out is deprecated, use this.cli')
    return this.cli
  }

  async init() {
    const { argv, flags, args } = await parse({
      flags: this.constructor.flags || {},
      args: this.constructor.args || [],
      strict: !this.constructor.variableArgs,
      argv: this.argv.slice(2),
    })
    this.flags = flags
    this.argv = argv
    this.args = args
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
  async run(...rest: void[]): Promise<void> {}

  get stdout(): string {
    return this.out.stdout.output
  }

  get stderr(): string {
    return this.out.stderr.output
  }

  static buildHelp(config: Config): string {
    let help = new Help(config)
    return help.command(this)
  }

  static buildHelpLine(config: Config): [string, string | undefined] {
    let help = new Help(config)
    return help.commandLine(this)
  }
}
