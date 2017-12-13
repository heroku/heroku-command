const pjson = require('../package.json')
import { buildConfig, Config, ConfigOptions, Plugin } from 'cli-engine-config'
import { HTTP } from 'http-call'
import Help from './help'
import { cli, CLI } from 'cli-ux'
import { parse, IArg } from 'cli-flags'

export interface CommandClass<T extends Command> {
  new ({ config }: { config?: ConfigOptions }): T
}

export async function run<T extends Command>(Command: CommandClass<T>, config?: ConfigOptions): Promise<T> {
  const cmd = new Command({ config })
  try {
    await cmd.init()
    await cmd.run()
    await cmd.out.done()
  } catch (err) {
    cmd.out.error(err)
  }
  return cmd
}

export class Command {
  static topic: string
  static command: string | undefined
  static description: string | undefined
  static hidden: boolean
  static usage: string | undefined
  static help: string | undefined
  static aliases: string[] = []
  static variableArgs = false
  // TODO: not any type
  static flags: { [name: string]: any }
  static args: IArg[] = []
  static _version = pjson.version
  static plugin: Plugin | undefined

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
    cli.warn('command.mock() is deprecated. Use cli-engine-test')
    argv.unshift('cmd')
    return this.run({ argv, mock: true })
  }

  /**
   * instantiate and run the command
   */
  static run(config?: ConfigOptions): Promise<Command> {
    return run(this, config)
  }

  get ctor(): typeof Command {
    return this.constructor as typeof Command
  }
  config: Config
  http: typeof HTTP
  cli: CLI
  out: CLI
  // TODO: no any
  flags: { [name: string]: any } = {}
  argv: string[]
  args: { [name: string]: string } = {}

  constructor(options: { config?: ConfigOptions } = {}) {
    this.config = buildConfig(options.config)
    this.argv = this.config.argv
    const { cli } = require('cli-ux')
    this.out = this.cli = cli
    ;(<any>this.out).color = require('./color').color
    this.http = HTTP.defaults({
      headers: {
        'user-agent': `${this.config.name}/${this.config.version} (${this.config.platform}-${this.config.arch}) node-${
          process.version
        }`,
      },
    })
  }

  async init() {
    const { argv, flags, args } = await parse({
      flags: this.ctor.flags || {},
      argv: this.argv.slice(1),
      args: this.ctor.args || [],
      strict: !this.ctor.variableArgs,
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
  async run(): Promise<void> {}

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
