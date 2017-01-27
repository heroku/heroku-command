'use strict'

const auth = require('./auth')

function api (klass, options = {}) {
  auth(klass, {required: options.required})
  if (!klass.prepare) klass.prepare = []
  klass.prepare.push(function () {
    const Heroku = require('heroku-client')
    this.api = new Heroku({token: this.auth})
  })
}

module.exports = api
