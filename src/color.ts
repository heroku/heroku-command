import * as chalk from 'chalk'

const CustomColors = {
  // map gray -> dim because it's not solarized compatible
  gray: chalk.dim,
  grey: chalk.dim,
  cmd: chalk.cyan.bold,
}

export const color = new Proxy(chalk, {
  get: (chalk, name) => {
    if ((<any>CustomColors)[name]) return (<any>CustomColors)[name]
    return (<any>chalk)[name]
  },
}) as typeof CustomColors & typeof chalk
