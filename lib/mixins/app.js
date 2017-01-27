'use strict'

const APP_FLAG = {
  name: 'app',
  char: 'a',
  description: 'app to run command against',
  hasValue: true
}

function app (klass, options = {}) {
  if (!klass.flags) klass.flags = []
  klass.flags.push(APP_FLAG)
  if (!klass.prepare) klass.prepare = []
  klass.prepare.push(function () {
    this.app = this.flags.app
    if (!this.app && options.required !== false) throw new Error('No app specified')
  })
}

module.exports = app
