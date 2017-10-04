import { InputArgs, InputFlags, OutputArgs, OutputFlags } from 'cli-flags'
import { Config, ConfigOptions, Plugin, ICommand } from 'cli-engine-config'
import { HTTP } from 'http-call'
import { deps } from './deps'

const pjson = require('../package.json')
const debug = require('debug')('cli-engine-command')

export class Command implements ICommand {
  static __config: {
    _version: string
    id?: string
    plugin?: Plugin
  } = { _version: pjson.version as string }
  get __config(): typeof Command.__config {
    return (<any>this.constructor).__config
  }

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
  static async mock<T extends Command>(...argv: string[]): Promise<T> {
    const cmd = new this({ argv: ['argv0', 'argv1'].concat(argv), mock: true }) as T
    await cmd._run()
    return cmd
  }

  config: Config
  http: typeof HTTP
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
        deps.CLI.warn(`${from} is defined as a static property on ${this.__config.id}`)
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
      await deps.CLI.done()
    } catch (err) {
      deps.CLI.error(err)
    }
  }

  /**
   * sets up the command and parses the flags just before it is run
   */
  async init() {
    this.color = deps.Color.color
    this.http = deps.HTTP.defaults({
      headers: {
        'user-agent': `${this.config.name}/${this.config.version} (${this.config.platform}-${this.config
          .arch}) node-${process.version}`,
      },
    })
    if (!this.config.mock) deps.CLI.handleUnhandleds()
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
    deps.CLI.done()
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
