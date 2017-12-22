const pjson = require('../package.json')
import { ConfigOptions, IConfig, IPlugin } from 'cli-engine-config'
import { args } from 'cli-flags'
import { HTTP } from 'http-call'
import deps from './deps'
import { IFlag } from './flags'

export interface IMockReturn<T extends Command> {
  cmd: T
  stdout: string
  stderr: string
}

export type CommandRunFn = <T extends Command>(this: ICommandClass<T>, argv: string[], config: IConfig) => Promise<T>
export type CommandMockFn = <T extends Command>(
  this: ICommandClass<T>,
  argv?: string[],
  config?: ConfigOptions,
) => Promise<IMockReturn<T>>

export interface ICommandClass<T extends Command> {
  mock: CommandMockFn
  run: CommandRunFn
  new (config: IConfig): T
}

export abstract class Command {
  static topic: string
  static command: string | undefined
  static description: string | undefined
  static hidden: boolean
  static usage: string | undefined
  static help: string | undefined
  static aliases: string[] = []
  static variableArgs = false
  static flags: { [name: string]: IFlag<any> }
  static args: args.IArg[] = []
  // tslint:disable-next-line
  static _version = pjson.version
  static plugin: IPlugin | undefined

  static get id(): string {
    let cmd = []
    if (this.topic) cmd.push(this.topic)
    if (this.command) cmd.push(this.command)
    return cmd.join(':')
  }

  /**
   * instantiate and run the command setting {mock: true} in the config (shorthand method)
   */
  static mock: CommandMockFn = async function(argv: string[] = [], config: ConfigOptions = {}) {
    if (deps.cli) deps.cli.config.mock = true
    const cmd = await this.run(argv, deps.Config.buildConfig(config))
    return {
      cmd,
      stderr: deps.cli ? deps.cli.stderr.output : 'cli-ux not found',
      stdout: deps.cli ? deps.cli.stdout.output : 'cli-ux not found',
    }
  }

  /**
   * instantiate and run the command
   */
  static run: CommandRunFn = async function(argv: string[] = [], config: IConfig) {
    const cmd = new this(config)
    try {
      await cmd.init(argv)
      await cmd.run()
      if (deps.cli) await deps.cli.done()
    } catch (err) {
      if (deps.cli) deps.cli.error(err)
      else throw err
    }
    return cmd
  }

  static buildHelp(config: IConfig): string {
    let help = new deps.Help(config)
    return help.command(this)
  }

  static buildHelpLine(config: IConfig): [string, string | undefined] {
    let help = new deps.Help(config)
    return help.commandLine(this)
  }

  http: typeof HTTP
  flags: { [name: string]: any } = {}
  argv: string[]
  args: { [name: string]: string } = {}

  // prevent setting things that need to be static
  topic: null
  command: null
  description: null
  hidden: null
  usage: null
  help: null
  aliases: null

  get ctor(): typeof Command {
    return this.constructor as typeof Command
  }

  constructor(protected config: IConfig) {
    if (deps.HTTP) {
      this.http = deps.HTTP.defaults({
        headers: {
          'user-agent': `${this.config.name}/${this.config.version} (${this.config.platform}-${
            this.config.arch
          }) node-${process.version}`,
        },
      })
    }
  }

  async init(argv: string[]) {
    const parse = await deps.CLIFlags.parse({
      argv,
      args: this.ctor.args || [],
      flags: this.ctor.flags || {},
      strict: !this.ctor.variableArgs,
    })
    this.flags = parse.flags
    this.argv = parse.argv
    this.args = parse.args
  }

  /**
   * actual command run code goes here
   */
  abstract async run(): Promise<void>
}
