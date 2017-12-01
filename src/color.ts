import * as supports from 'supports-color'
import chalk from 'chalk'
import * as ansiStyles from 'ansi-styles'

export const CustomColors: {
  supports: typeof supports
  gray: (s: string) => string
  grey: (s: string) => string
  attachment: (s: string) => string
  addon: (s: string) => string
  configVar: (s: string) => string
  release: (s: string) => string
  cmd: (s: string) => string
  app: (s: string) => string
  heroku: (s: string) => string
} = {
  supports,
  // map gray -> dim because it's not solarized compatible
  gray: chalk.dim,
  grey: chalk.dim,
  attachment: (s: string) => chalk.cyan(s),
  addon: (s: string) => chalk.yellow(s),
  configVar: (s: string) => chalk.green(s),
  release: (s: string) => chalk.blue.bold(s),
  cmd: (s: string) => chalk.cyan.bold(s),
  app: (s: string) => color.heroku(`⬢ ${s}`),
  heroku: (s: string): string => {
    if (!color.supports) return s
    let has256 = color.supports.has256 || (process.env.TERM || '').indexOf('256') !== -1
    return has256 ? '\u001b[38;5;104m' + s + ansiStyles.reset.open : chalk.magenta(s)
  },
}

export const color: typeof CustomColors & typeof chalk = new Proxy(chalk, {
  get: (chalk, name) => {
    if ((<any>CustomColors)[name]) return (<any>CustomColors)[name]
    return (<any>chalk)[name]
  },
}) as typeof CustomColors & typeof chalk
