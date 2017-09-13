import { parse, InputFlags, InputArgs, OutputArgs, OutputFlags } from 'cli-flags'
import { buildConfig, Config, ConfigOptions, Plugin, ICommand } from 'cli-engine-config'
import { HTTP } from 'http-call'
import { Help } from './help'
import { CLI } from 'cli-ux'
import { deprecate } from 'util'
import chalk = require('chalk')

const pjson = require('../package.json')
const debug = require('debug')('cli-engine-command')

export interface IMockOutput<T extends Command> {
  cmd: T
  stdout: string
  stderr: string
}

export class Command implements ICommand {
  topic?: string
  command?: string
  name?: string
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
    if (this.name) return this.name
    let cmd = []
    if (this.topic) cmd.push(this.topic)
    if (this.command) cmd.push(this.command)
    let id = cmd.join(':')
    if (id) return id
    let ctor = this.constructor as typeof Command
    return ctor.name
  }

  /**
   * instantiate and run the command setting {mock: true} in the config (shorthand method)
   */
  static async mock<T extends Command>(...argv: string[]): Promise<IMockOutput<T>> {
    argv.unshift('argv0', 'argv1')
    const cmd = (await this.run({ argv, mock: true })) as T
    return {
      cmd,
      stdout: cmd.cli.stdout.output,
      stderr: cmd.cli.stderr.output,
    }
  }

  /**
   * instantiate and run the command
   */
  static async run(config?: ConfigOptions): Promise<Command> {
    const cmd = new this(config)
    try {
      debug('initializing %s version: %s', cmd.id, cmd._version)
      debug('argv: %o', cmd.config.argv)
      await cmd.init()
      debug('run')
      await cmd.run()
      debug('done')
      await cmd.cli.done()
    } catch (err) {
      cmd.cli.error(err)
    }
    return cmd
  }

  config: Config
  http: typeof HTTP
  cli: CLI
  flags: OutputFlags<this['Flags']>
  argv: string[]
  args: OutputArgs
  color: typeof chalk

  constructor(config?: ConfigOptions) {
    this.config = buildConfig(config)
    this.color = require('chalk')
    const { CLI } = require('cli-ux')
    this.cli = new CLI({ debug: this.config.debug, mock: this.config.mock, errlog: this.config.errlog })
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
    this.cli.handleUnhandleds()
    if (this.variableArgs) {
      deprecate(() => {}, 'variableArgs is deprecated. Use strict = true instead.')
    }
    const { argv, flags, args } = await parse<this['Flags']>({
      flags: this.Flags,
      args: this.Args,
      strict: this.strict !== false && !this.variableArgs,
      argv: this.config.argv.slice(2),
    })
    this.flags = flags
    this.argv = argv
    this.args = args
  }

  /**
   * actual command run code goes here
   */
  async run(): Promise<void> {}

  buildHelp(): string {
    let help = new Help(this.config)
    return help.command(this)
  }

  buildHelpLine(): [string, string | undefined] {
    let help = new Help(this.config)
    return help.commandLine(this)
  }
}
