'use strict'

const http = require('../http')

module.exports = (options = {}) => {
  return superclass => class extends superclass {
    async init () {
      await super.init()
      let auth = process.env.HEROKU_API_KEY
      if (!auth) {
        const netrc = require('netrc')()
        const host = netrc['api.heroku.com']
        if (host) auth = host.password
      }
      if (!auth && options.required !== false) {
        throw new Error('Not logged in')
      }
      const HTTP = require('http-call')
      this.heroku = new HTTP({
        host: 'api.heroku.com',
        protocol: 'https:',
        requestMiddleware: http.requestMiddleware.bind(this),
        responseMiddleware: http.responseMiddleware.bind(this),
        auth: `:${auth}`,
        headers: {
          'user-agent': `heroku-cli/${this.options.version}`,
          'accept': 'application/vnd.heroku+json; version=3'
        }
      })
    }
  }
}
