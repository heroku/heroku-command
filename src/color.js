// @flow
/* globals
   Class
   $Shape
 */

import supports from 'supports-color'
import Base, {type Config} from './base'
import chalk from 'chalk'

const CustomColors = {
  attachment: s => chalk.cyan(s),
  addon: s => chalk.yellow(s),
  configVar: s => chalk.green(s),
  release: s => chalk.blue.bold(s),
  cmd: s => chalk.cyan.bold(s),
  app: s => process.platform !== 'win32' ? CustomColors.heroku(`⬢ ${s}`) : CustomColors.heroku(s),
  heroku: s => {
    if (!chalk.enabled) return s
    let has256 = supports.has256 || (process.env.TERM || '').indexOf('256') !== -1
    return has256 ? '\u001b[38;5;104m' + s + chalk.styles.reset.open : chalk.magenta(s)
  }
}

type Color = $Shape<typeof chalk & typeof CustomColors>

export default (Base: Class<Base>) => class extends Base {
  constructor (config: Config) {
    super(config)
    if (!this.supportsColor) chalk.enabled = false
  }

  get supportsColor (): typeof supports | null {
    if (this.slack) return
    if (['false', '0'].indexOf((process.env.COLOR || '').toLowerCase()) !== -1) return
    return supports
  }

  get color (): Color {
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
