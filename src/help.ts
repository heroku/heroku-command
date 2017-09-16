import { renderList } from 'cli-ux/lib/list'
import { Config, ICommand } from 'cli-engine-config'
import { IArg, IFlag, flagUsages } from 'cli-flags'
import * as chalk from 'chalk'

function buildUsage(command: ICommand): string {
  if (command.options.usage) return command.options.usage.trim()
  let cmd = command.__config.id
  if (!command.options.args) return (cmd || '').trim()
  let args = command.options.args.map(renderArg)
  return `${cmd} ${args.join(' ')}`.trim()
}

function renderArg(arg: IArg<any>): string {
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
    let flags = Object.entries(cmd.options.flags || {})
      .filter(([, f]) => !f.hidden)
      .map(([k, f]) => {
        f.name = k
        return f
      })
    let args = (cmd.options.args || []).filter(a => !a.hidden)
    let hasFlags = flags.length ? ` ${chalk.blue('[flags]')}` : ''
    let usage = `${chalk.bold('Usage:')} ${this.config.bin} ${buildUsage(cmd)}${hasFlags}\n`
    return [
      usage,
      cmd.options.description ? `\n${chalk.bold(cmd.options.description.trim())}\n` : '',
      this.renderAliases(cmd.options.aliases),
      this.renderArgs(args),
      this.renderFlags(flags),
      cmd.options.help ? `\n${cmd.options.help.trim()}\n` : '',
    ].join('')
  }

  commandLine(cmd: ICommand): [string, string | undefined] {
    return [buildUsage(cmd), cmd.options.description ? chalk.dim(cmd.options.description) : null] as [
      string,
      string | undefined
    ]
  }

  renderAliases(aliases: string[] | undefined): string {
    if (!aliases || !aliases.length) return ''
    let a = aliases.map(a => `  $ ${this.config.bin} ${a}`).join('\n')
    return `\n${chalk.blue('Aliases:')}\n${a}\n`
  }

  renderArgs(args: IArg<string>[]): string {
    if (!args.find(f => !!f.description)) return ''
    return (
      '\n' +
      renderList(
        args.map(a => {
          return [a.name!.toUpperCase(), a.description ? chalk.dim(a.description) : null] as [string, string]
        }),
      ) +
      '\n'
    )
  }

  renderFlags(flags: IFlag<any>[]): string {
    if (!flags.length) return ''
    return `\n${chalk.blue('Flags:')}\n` + renderList(flagUsages(flags)) + '\n'
  }
}
