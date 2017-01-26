'use strict'

function auth (options = {}) {
  return function () {
    this.constructor._init.push(function () {
      this.auth = process.env.HEROKU_API_KEY
      if (!this.auth) {
        const netrc = require('netrc')()
        const host = netrc['api.heroku.com']
        if (host) this.auth = host.password
      }
      if (!this.auth && options.required !== false) {
        throw new Error('Not logged in')
      }
    })
  }
}

module.exports = auth
