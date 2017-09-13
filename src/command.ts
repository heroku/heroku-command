import { parse, InputFlags, InputArgs, OutputArgs, OutputFlags } from 'cli-flags'
import { buildConfig, Config, ConfigOptions, Plugin, ICommand } from 'cli-engine-config'
import { HTTP } from 'http-call'
import { Help } from './help'
import { CLI } from 'cli-ux'
import color = require('./color')

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
  _version = pjson.version
  plugin?: Plugin

  parse: {
    args?: InputArgs
    flags: InputFlags
    strict?: boolean
  } = { flags: {} }

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
    await cmd._run()
    return cmd
  }

  config: Config
  http: typeof HTTP
  cli: CLI
  flags: OutputFlags<this['parse']['flags']>
  argv: string[]
  args: OutputArgs
  color: typeof color.color

  constructor(config?: ConfigOptions) {
    this.config = buildConfig(config)
  }

  /**
   * runs the command with the lifecycle scripts [init/run/done]
   */
  async _run() {
    try {
      debug('initializing %s version: %s', this.id, this._version)
      debug('argv: %o', this.config.argv)
      await this.init()
      debug('run')
      await this.run()
      debug('done')
      await this.cli.done()
    } catch (err) {
      this.cli.error(err)
    }
  }

  /**
   * sets up the command and parses the flags just before it is run
   */
  async init() {
    this.color = require('./color').color
    const { CLI } = require('cli-ux')
    this.cli = new CLI({ debug: this.config.debug, mock: this.config.mock, errlog: this.config.errlog })
    this.http = HTTP.defaults({
      headers: {
        'user-agent': `${this.config.name}/${this.config.version} (${this.config.platform}-${this.config
          .arch}) node-${process.version}`,
      },
    })
    if (!this.config.mock) this.cli.handleUnhandleds()
    const { argv, flags, args } = await parse<this['parse']['flags']>({
      ...this.parse,
      argv: this.config.argv.slice(2),
    })
    this.flags = flags
    this.argv = argv
    this.args = args
  }
  async run(): Promise<void> {}

  /**
   * handle any needed cleanup
   */
  async done() {
    this.cli.done()
  }

  buildHelp(): string {
    let help = new Help(this.config)
    return help.command(this)
  }

  buildHelpLine(): [string, string | undefined] {
    let help = new Help(this.config)
    return help.commandLine(this)
  }
}
