// @flow
/* globals
   Class
 */

import type Command from '../command'
import type {Flag} from '../flag'

const APP_FLAG: Flag = {
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
    _app: string

    static get flags (): Flag[] { return this._flags.concat([APP_FLAG]) }
    static set flags (flags: Flag[]) { this._flags = flags }

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
