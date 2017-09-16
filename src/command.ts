import { InputArgs, InputFlags, OutputArgs, OutputFlags } from 'cli-flags'
import { Config, ConfigOptions, Plugin, ICommand } from 'cli-engine-config'
import { HTTP } from 'http-call'
import { deps } from './deps'
import { CLI } from 'cli-ux'

const pjson = require('../package.json')
const debug = require('debug')('cli-engine-command')

export interface IMockOutput<T extends Command> {
  cmd: T
  stdout: string
  stderr: string
}

export class Command implements ICommand {
  __config: {
    _version: string
    id?: string
    plugin?: Plugin
  } = { _version: pjson.version as string }

  options: {
    argv?: string[]
    flags?: InputFlags
    args?: InputArgs
    strict?: boolean
    description?: string
    hidden?: boolean
    usage?: string
    help?: string
    aliases?: string[]
  } = {}

  /**
   * instantiate and run the command setting {mock: true} in the config (shorthand method)
   */
  static async mock<T extends Command>(...argv: string[]): Promise<IMockOutput<T>> {
    const cmd = new this({ argv: ['argv0', 'argv1'].concat(argv), mock: true }) as T
    await cmd._run()
    return {
      cmd,
      stdout: cmd.cli.stdout.output,
      stderr: cmd.cli.stderr.output,
    }
  }

  config: Config
  http: typeof HTTP
  cli: CLI
  flags: OutputFlags<this['options']['flags']>
  argv: string[]
  args: OutputArgs
  color: typeof deps.Color.color

  constructor(config?: ConfigOptions) {
    this.config = deps.Config.buildConfig(config)

    // port flow-style options
    const ctor: any = this.constructor
    const props = [
      ['flags', 'flags'],
      ['args', 'args'],
      ['variableArgs', 'strict'],
      ['description', 'description'],
      ['hidden', 'hidden'],
      ['usage', 'usage'],
      ['help', 'help'],
      ['aliases', 'aliases'],
    ]
    for (let [from, to] of props) {
      if (ctor[from]) {
        let cli = new deps.CLI({ mock: this.config.mock })
        cli.warn(`${from} is defined as a static property on ${this.__config.id}`)
        ;(<any>this.options)[to] = ctor[from]
      }
    }
  }

  /**
   * runs the command with the lifecycle scripts [init/run/done]
   */
  async _run(argv?: string[]) {
    try {
      this.options.argv = argv
      debug('initializing %s version: %s', this.__config.id, this.__config._version)
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
    this.color = deps.Color.color
    const CLI = deps.CLI
    this.cli = new CLI({ debug: this.config.debug, mock: this.config.mock, errlog: this.config.errlog })
    this.http = deps.HTTP.defaults({
      headers: {
        'user-agent': `${this.config.name}/${this.config.version} (${this.config.platform}-${this.config
          .arch}) node-${process.version}`,
      },
    })
    if (!this.config.mock) this.cli.handleUnhandleds()
    this.options.argv = this.options.argv || this.config.argv.slice(2)
    debug('argv: %o', this.options.argv)
    const { argv, flags, args } = await deps.CLIFlags.parse<this['options']['flags']>(this.options)
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
    let help = new deps.Help(this.config)
    return help.command(this)
  }

  buildHelpLine(): [string, string | undefined] {
    let help = new deps.Help(this.config)
    return help.commandLine(this)
  }
}
