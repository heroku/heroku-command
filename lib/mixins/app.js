'use strict'

const APP_FLAG = {
  name: 'app',
  char: 'a',
  description: 'app to run command against',
  hasValue: true
}

module.exports = (options = {}) => {
  return superclass => {
    class klass extends superclass {
      async init () {
        await super.init()
        if (!this.app && options.required !== false) throw new Error('No app specified')
      }

      get app () {
        if (this._app) return this._app
        this._app = this.flags.app
        return this._app
      }
    }
    klass.flags.push(APP_FLAG)
    return klass
  }
}
