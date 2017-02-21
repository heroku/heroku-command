// @flow
/* globals
   $Shape
 */

import supports from 'supports-color'
import chalk from 'chalk'

export const CustomColors = {
  attachment: (s: string) => chalk.cyan(s),
  addon: (s: string) => chalk.yellow(s),
  configVar: (s: string) => chalk.green(s),
  release: (s: string) => chalk.blue.bold(s),
  cmd: (s: string) => chalk.cyan.bold(s),
  app: (s: string) => process.platform !== 'win32' ? CustomColors.heroku(`⬢ ${s}`) : CustomColors.heroku(s),
  heroku: (s: string) => {
    if (!chalk.enabled) return s
    let has256 = supports.has256 || (process.env.TERM || '').indexOf('256') !== -1
    return has256 ? '\u001b[38;5;104m' + s + chalk.styles.reset.open : chalk.magenta(s)
  }
}

type ColorType = $Shape<typeof chalk & typeof CustomColors>

export default class Color {
  _color: ColorType

  constructor () {
    if (!this.supportsColor) chalk.enabled = false
  }

  get supportsColor (): typeof supports | null {
    if (this.slack) return
    if (['false', '0'].indexOf((process.env.COLOR || '').toLowerCase()) !== -1) return
    return supports
  }

  get color (): ColorType {
    if (this._color) return this._color
    this._color = new Proxy(chalk, {
      get: (chalk, name) => {
        if (CustomColors[name]) return CustomColors[name]
        return chalk[name]
      }
    })
    return this._color
  }
}
