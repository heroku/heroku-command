import { renderList } from 'cli-ux/lib/list'
import { Config, ICommand } from 'cli-engine-config'
import { IArg, IFlag } from 'cli-flags'
import * as chalk from 'chalk'

function buildUsage(command: ICommand): string {
  if (command.usage) return command.usage.trim()
  let cmd = command.id
  if (!command.Args) return cmd.trim()
  let args = command.Args.map(renderArg)
  return `${cmd} ${args.join(' ')}`.trim()
}

function renderArg(arg: IArg): string {
  let name = arg.name!.toUpperCase()
  if (arg.required !== false && arg.optional !== true) return `${name}`
  else return `[${name}]`
}

export class Help {
  config: Config

  constructor(config: Config) {
    this.config = config
  }

  command(cmd: ICommand): string {
    let flags = Object.entries(cmd.Flags || {}).filter(([, flag]) => !flag.hidden)
    let args = (cmd.Args || []).filter(a => !a.hidden)
    let hasFlags = flags.length ? ` ${chalk.blue('[flags]')}` : ''
    let usage = `${chalk.bold('Usage:')} ${this.config.bin} ${buildUsage(cmd)}${hasFlags}\n`
    return [
      usage,
      cmd.description ? `\n${chalk.bold(cmd.description.trim())}\n` : '',
      this.renderAliases(cmd.aliases),
      this.renderArgs(args),
      this.renderFlags(flags),
      cmd.help ? `\n${cmd.help.trim()}\n` : '',
    ].join('')
  }

  commandLine(cmd: ICommand): [string, string | undefined] {
    return [buildUsage(cmd), cmd.description ? chalk.dim(cmd.description) : null] as [string, string | undefined]
  }

  renderAliases(aliases: string[] | undefined): string {
    if (!aliases || !aliases.length) return ''
    let a = aliases.map(a => `  $ ${this.config.bin} ${a}`).join('\n')
    return `\n${chalk.blue('Aliases:')}\n${a}\n`
  }

  renderArgs(args: IArg[]): string {
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

  renderFlags(flags: [string, IFlag<any>][]): string {
    if (!flags.length) return ''
    flags.sort((a, b) => {
      if (a[1].char && !b[1].char) return -1
      if (b[1].char && !a[1].char) return 1
      if (a[0] < b[0]) return -1
      return b[0] < a[0] ? 1 : 0
    })
    return (
      `\n${chalk.blue('Flags:')}\n` +
      renderList(
        flags.map(([name, f]) => {
          let label = []
          if (f.char) label.push(`-${f.char}`)
          if (name) label.push(` --${name}`)
          let usage = f.type === 'option' ? ` ${name.toUpperCase()}` : ''
          let description = f.description || ''
          if (f.required) description = `(required) ${description}`
          return [` ${label.join(',').trim()}` + usage, description ? chalk.dim(description) : null] as [
            string,
            string | undefined
          ]
        }),
      ) +
      '\n'
    )
  }
}
