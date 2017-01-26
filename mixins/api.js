'use strict'

const auth = require('./auth')

function api (options = {}) {
  return function () {
    auth({required: options.required}).call(this)
    this.constructor._init.push(function () {
      const Heroku = require('heroku-client')
      this.api = new Heroku({token: this.auth})
    })
  }
}

module.exports = api
