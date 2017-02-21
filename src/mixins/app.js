// @flow
/* globals
   Class
 */

import type Command from '../command'

const APP_FLAG = {
  name: 'app',
  char: 'a',
  description: 'app to run command against',
  hasValue: true
}

type Options = {
  required?: boolean
}

export default function (Command: Class<Command>, options: Options = {}) {
  return class AppMixin extends Command {
    static flags = [APP_FLAG]
    _app: string

    async init () {
      await super.init()
      if (!this.app && options.required !== false) {
        throw new Error('No app specified')
      }
    }

    get app (): string {
      if (this._app) return this._app
      if (typeof this.flags.app === 'string') this._app = this.flags.app
      return this._app
    }
  }
}
