'use strict'

const APP_FLAG = {
  name: 'app',
  char: 'a',
  description: 'app to run command against',
  hasValue: true
}

function app (options = {}) {
  return function app () {
    this.constructor.flags.push(APP_FLAG)
    this.constructor._init.push(function () {
      this.app = this.flags.app
    })
  }
}

module.exports = app
