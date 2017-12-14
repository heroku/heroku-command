import { renderList } from 'cli-ux/lib/list'
import { Config, ICommand } from 'cli-engine-config'
import { IArg, IFlag, flagUsages } from 'cli-flags'
import chalk from 'chalk'

function buildUsage(command: ICommand): string {
  if (command.usage) return command.usage.trim()
  let cmd = command.id
  if (!command.args) return (cmd || '').trim()
  let args = command.args.map(renderArg)
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
    let flags = Object.entries(cmd.flags || {})
      .filter(([, f]) => !f.hidden)
      .map(([k, f]) => {
        f.name = k
        return f
      })
    let args = (cmd.args || []).filter(a => !a.hidden)
    let hasFlags = flags.length ? ` ${chalk.blue('[flags]')}` : ''
    let usage = `${chalk.bold('Usage:')} ${this.config.bin} ${buildUsage(cmd)}${hasFlags}\n`
    return [
      usage,
      cmd.description ? `\n${chalk.bold(cmd.description.trim())}\n` : '',
      this.renderAliases(this.config.aliases[cmd.id]),
      this.renderArgs(args),
      this.renderFlags(flags),
      cmd.help ? `\n${cmd.help.trim()}\n` : '',
    ].join('')
  }

  commandLine(cmd: ICommand): [string, string | undefined] {
    return [buildUsage(cmd), cmd.description ? chalk.dim(cmd.description) : undefined] as [string, string | undefined]
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
          return [a.name!.toUpperCase(), a.description ? chalk.dim(a.description) : undefined] as [string, string]
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
