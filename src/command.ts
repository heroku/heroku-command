const pjson = require('../package.json')
import deps from './deps'
import { Config, ConfigOptions, Plugin } from 'cli-engine-config'
import { HTTP } from 'http-call'
import { args } from 'cli-flags'
import { IFlag } from './flags'

export type MockReturn<T extends Command> = {
  cmd: T
  stdout: string
  stderr: string
}

export type CommandRunFn = <T extends Command>(this: CommandClass<T>, config?: ConfigOptions) => Promise<T>
export type CommandMockFn = <T extends Command>(this: CommandClass<T>, ...argv: string[]) => Promise<MockReturn<T>>

export interface CommandClass<T extends Command> {
  new ({ config }: { config?: ConfigOptions }): T
  run: CommandRunFn
  mock: CommandMockFn
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
  static flags: { [name: string]: IFlag<any> }
  static args: args.IArg[] = []
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
  static mock: CommandMockFn = async function(...argv: string[]) {
    const cmd = await this.run({ argv: ['cmd', ...argv] })
    return {
      cmd,
      stdout: deps.cli.stdout.output,
      stderr: deps.cli.stderr.output,
    }
  }

  /**
   * instantiate and run the command
   */
  static run: CommandRunFn = async function(config?: ConfigOptions) {
    const cmd = new this({ config })
    try {
      await cmd.init()
      await cmd.run()
      await deps.cli.done()
    } catch (err) {
      deps.cli.error(err)
    }
    return cmd
  }

  get ctor(): typeof Command {
    return this.constructor as typeof Command
  }
  config: Config
  http: typeof HTTP
  flags: { [name: string]: any } = {}
  argv: string[]
  args: { [name: string]: string } = {}

  constructor(options: { config?: ConfigOptions } = {}) {
    this.config = deps.Config.buildConfig(options.config)
    this.argv = this.config.argv
    this.http = deps.HTTP.defaults({
      headers: {
        'user-agent': `${this.config.name}/${this.config.version} (${this.config.platform}-${this.config.arch}) node-${
          process.version
        }`,
      },
    })
  }

  async init() {
    const { argv, flags, args } = await deps.CLIFlags.parse({
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

  static buildHelp(config: Config): string {
    let help = new deps.Help(config)
    return help.command(this)
  }

  static buildHelpLine(config: Config): [string, string | undefined] {
    let help = new deps.Help(config)
    return help.commandLine(this)
  }
}
