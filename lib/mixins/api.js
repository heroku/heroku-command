'use strict'

module.exports = (options = {}) => {
  return superclass => class extends superclass {
    get auth () {
      if (this._auth) return this._auth
      this._auth = process.env.HEROKU_API_KEY
      if (!this._auth) {
        const netrc = require('netrc')()
        const host = netrc['api.heroku.com']
        if (host) this._auth = host.password
      }
      return this._auth
    }

    get api () {
      if (this._api) return this._api
      const Heroku = require('heroku-client')
      this._api = new Heroku({token: this.auth})
      return this._api
    }

    async init () {
      await super.init()
      if (!this.auth && options.required !== false) {
        throw new Error('Not logged in')
      }
    }
  }
}
