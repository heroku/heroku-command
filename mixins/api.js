'use strict'

const auth = require('./auth')

function api (options = {}) {
  return function api () {
    auth({required: options.required}).call(this)
    const Heroku = require('heroku-client')
    this.api = new Heroku({token: this.auth})
  }
}

module.exports = api
