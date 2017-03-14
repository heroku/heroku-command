// @flow

import Command from '../command' // eslint-disable-line
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

declare class App extends Command {
  app: string
}

export default function <T: Class<Command>> (Base: T, options: Options = {}): $Shape<Class<App>> {
  return class AppMixin extends Base {
    _app: string

    static get flags (): Flag[] { return super.flags.concat([APP_FLAG]) }
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
      // TODO: read from git remote
      return this._app
    }
  }
}
