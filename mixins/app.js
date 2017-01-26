'use strict'

function app (options = {}) {
  return function app () {
    Object.defineProperty(this, 'app', {
      get: function () { return 'forkee' }
    })
  }
}

module.exports = app
