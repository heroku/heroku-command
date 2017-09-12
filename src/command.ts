import { parse, InputFlags, InputArgs, OutputArgs, OutputFlags } from 'cli-flags'
import { buildConfig, Config, ConfigOptions, Plugin, ICommand } from 'cli-engine-config'
import { HTTP } from 'http-call'
import { Help } from './help'
import { CLI } from 'cli-ux'
import { deprecate } from 'util'

const pjson = require('../package.json')

export class Command implements ICommand {
  // constructor: typeof Command // Explicitly declare constructor property

  topic?: string
  command?: string
  description?: string
  hidden: boolean = false
  usage?: string
  help?: string
  aliases: string[] = []
  strict = true
  variableArgs: boolean = false
  Flags: InputFlags = {}
  Args: InputArgs = []
  _version = pjson.version
  plugin?: Plugin

  get id(): string {
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
  flags: OutputFlags<this['Flags']>
  argv: string[]
  args: OutputArgs

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
    if (this.variableArgs) {
      deprecate(() => {}, 'variableArgs is deprecated. Use strict = true instead.')
    }
    const { argv, flags, args } = await parse<this['Flags']>({
      flags: this.Flags,
      args: this.Args,
      strict: this.strict !== false && !this.variableArgs,
      argv: this.argv.slice(2),
    })
    this.flags = flags
    this.argv = argv
    this.args = args
  }

  /**
   * actual command run code goes here
   */
  async run(): Promise<void> {}

  get stdout(): string {
    // used in testing
    return this.cli.stdout.output
  }

  get stderr(): string {
    return this.cli.stderr.output
  }

  buildHelp(config: Config): string {
    let help = new Help(config)
    return help.command(this)
  }

  buildHelpLine(config: Config): [string, string | undefined] {
    let help = new Help(config)
    return help.commandLine(this)
  }
}
