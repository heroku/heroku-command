import deps from './deps'
import { Config, ICommand } from 'cli-engine-config'
import { flags, args } from 'cli-flags'

function buildUsage(command: ICommand): string {
  if (command.usage) return command.usage.trim()
  let cmd = command.id
  if (!command.args) return (cmd || '').trim()
  let args = command.args.map(renderArg)
  return `${cmd} ${args.join(' ')}`.trim()
}

function renderArg(arg: args.IArg<any>): string {
  let name = arg.name!.toUpperCase()
  if (arg.required) return `${name}`
  else return `[${name}]`
}

export class Help {
  config: Config

  constructor(config: Config) {
    this.config = config
  }

  command(cmd: ICommand): string {
    let flags = Object.entries(cmd.flags || {})
      .filter(([, f]) => !f.hidden)
      .map(([k, f]) => {
        f.name = k
        return f
      })
    let args = (cmd.args || []).filter(a => !a.hidden)
    let hasFlags = flags.length ? ` ${deps.chalk.blue('[flags]')}` : ''
    let usage = `${deps.chalk.bold('Usage:')} ${this.config.bin} ${buildUsage(cmd)}${hasFlags}\n`
    return [
      usage,
      cmd.description ? `\n${deps.chalk.bold(cmd.description.trim())}\n` : '',
      this.renderAliases(this.config.aliases[cmd.id]),
      this.renderArgs(args),
      this.renderFlags(flags),
      cmd.help ? `\n${cmd.help.trim()}\n` : '',
    ].join('')
  }

  commandLine(cmd: ICommand): [string, string | undefined] {
    return [buildUsage(cmd), cmd.description ? deps.chalk.dim(cmd.description) : undefined] as [
      string,
      string | undefined
    ]
  }

  renderAliases(aliases: string[] | undefined): string {
    if (!aliases || !aliases.length) return ''
    let a = aliases.map(a => `  $ ${this.config.bin} ${a}`).join('\n')
    return `\n${deps.chalk.blue('Aliases:')}\n${a}\n`
  }

  renderArgs(args: args.IArg<string>[]): string {
    if (!args.find(f => !!f.description)) return ''
    return (
      '\n' +
      deps.renderList(
        args.map(a => {
          return [a.name!.toUpperCase(), a.description ? deps.chalk.dim(a.description) : undefined] as [string, string]
        }),
      ) +
      '\n'
    )
  }

  renderFlags(flags: flags.IFlag<any>[]): string {
    if (!flags.length) return ''
    return `\n${deps.chalk.blue('Flags:')}\n` + deps.renderList(deps.CLIFlags.flagUsages(flags)) + '\n'
  }
}