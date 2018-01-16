const pjson = require('../package.json')
import { Config, ConfigOptions, IPlugin } from '@cli-engine/config'
import { args } from 'cli-flags'
import { HTTP } from 'http-call'
import { deprecate } from 'util'

import deps from './deps'
import * as flags from './flags'

export interface IMockReturn<T extends Command> {
  cmd: T
  stdout: string
  stderr: string
}

export type CommandRunFn = <T extends Command>(this: ICommandClass<T>, argv: string[], config: Config) => Promise<T>
export type CommandMockFn = <T extends Command>(
  this: ICommandClass<T>,
  argv?: string[],
  config?: ConfigOptions,
) => Promise<IMockReturn<T>>

export interface ICommandClass<T extends Command> {
  mock: CommandMockFn
  run: CommandRunFn
  new (config: Config): T
}

export abstract class Command {
  static id: string
  static description: string | undefined
  static hidden: boolean
  static usage: string | undefined
  static help: string | undefined
  static aliases: string[] = []
  static variableArgs = false
  static flags: flags.Input
  static args: args.IArg[] = []
  // tslint:disable-next-line
  static _version = pjson.version
  static base = `${pjson.name}@${pjson.version}`
  static plugin: IPlugin | undefined

  /**
   * instantiate and run the command setting {mock: true} in the config (shorthand method)
   */
  static mock: CommandMockFn = async function(argv: string[] = [], config: ConfigOptions = {}) {
    if (typeof argv === 'string') {
      argv = Array.from(arguments)
      // old-style call
      deprecate(() => {
        config = {}
      }, "`Command.mock('--foo', 'bar')` is deprecated. Please use `Command.mock(['--foo', 'bar'])` instead.")()
    }
    if (deps.cli) deps.cli.config.mock = true
    const cmd = await this.run(argv, new deps.Config(config))
    return {
      cmd,
      stderr: deps.cli ? deps.cli.stderr.output : 'cli-ux not found',
      stdout: deps.cli ? deps.cli.stdout.output : 'cli-ux not found',
    }
  }

  /**
   * instantiate and run the command
   */
  static run: CommandRunFn = async function(argv: string[] = [], config: Config) {
    const cmd = new this(config)
    try {
      await cmd.init(argv)
      await cmd.run()
      await cmd.done()
    } catch (err) {
      // throw HelpErr to allow the CLI to do something with it
      if (err instanceof deps.HelpErr) throw err
      if (!deps.cli) throw err
      deps.cli.error(err)
    }
    return cmd
  }

  static buildHelp(config: Config): string {
    let help = new deps.Help(config)
    return help.command(this)
  }

  static buildHelpLine(config: Config): [string, string | undefined] {
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

  protected debug: (...args: any[]) => void

  get ctor(): typeof Command {
    return this.constructor as typeof Command
  }

  constructor(protected config: Config) {
    this.debug = fetchDebug(this.ctor.id)
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

  /**
   * actual command run code goes here
   */
  abstract async run(): Promise<void>

  protected async init(argv: string[]) {
    this.debug('init version: %s argv: %o', this.ctor._version, argv)
    try {
      const parse = await deps.CLIFlags.parse({
        argv,
        args: this.ctor.args || [],
        flags: this.ctor.flags || {},
        strict: !this.ctor.variableArgs,
      })
      this.flags = parse.flags
      this.argv = parse.argv
      this.args = parse.args
    } catch (err) {
      if (err.message.match(/^Unexpected argument: (-h|help)/)) {
        throw new deps.HelpErr(err.message)
      }
      throw err
    }
  }

  protected async done() {
    try {
      if (deps.cli) await deps.cli.done()
    } catch (err) {
      if (deps.cli) deps.cli.warn(err)
      else
        // tslint:disable-next-line
        console.error(err)
    }
  }
}

function fetchDebug(id: string) {
  try {
    return require('debug')(`cli:command:${id}`)
  } catch (err) {
    return () => {}
  }
}
