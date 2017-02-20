'use strict'

import supports from 'supports-color'

export default Base => class extends Base {
  get supportsColor () {
    if (this.slack) return false
    if (['false', '0'].indexOf((process.env.COLOR || '').toLowerCase()) !== -1) return false
    return supports
  }

  get color () {
    if (this._color) return this._color

    this._color = require('chalk')
    this._color.enabled = this.supportsColor

    this._color.attachment = s => this._color.cyan(s)
    this._color.addon = s => this._color.yellow(s)
    this._color.configVar = s => this._color.green(s)
    this._color.release = s => this._color.blue.bold(s)
    this._color.cmd = s => this._color.cyan.bold(s)

    this._color.heroku = s => {
      if (!this.supportsColor) return s
      let has256 = this.supportsColor.has256 || (process.env.TERM || '').indexOf('256') !== -1
      return has256 ? '\u001b[38;5;104m' + s + this._color.styles.modifiers.reset.open : this._color.magenta(s)
    }

    this._color.app = s => this.supportsColor && process.platform !== 'win32' ? this._color.heroku(`⬢ ${s}`) : this._color.heroku(s)

    return this._color
  }
}
