'use strict'

function output () {
  this.log = function (...args) {
    if (this.slack) {
      this._output.push(...args)
    } else {
      console.log(...args)
    }
  }

  this.styledJSON = function (obj) {
    let json = JSON.stringify(obj, null, 2)
    if (this.supportsColor) {
      let cardinal = require('cardinal')
      let theme = require('cardinal/themes/jq')
      this.log(cardinal.highlight(json, {json: true, theme: theme}))
    } else {
      this.log(json)
    }
  }

  this.styledHeader = function (header) {
    this.log(this.color.gray('=== ') + this.color.bold(header))
  }

  this.styledObject = function (obj, keys) {
    const util = require('util')
    let keyLengths = Object.keys(obj).map(key => key.toString().length)
    let maxKeyLength = Math.max.apply(Math, keyLengths) + 2
    function pp (obj) {
      if (typeof obj === 'string' || typeof obj === 'number') {
        return obj
      } else if (typeof obj === 'object') {
        return Object.keys(obj).map(k => k + ': ' + util.inspect(obj[k])).join(', ')
      } else {
        return util.inspect(obj)
      }
    }
    let logKeyValue = (key, value) => {
      this.log(`${key}:` + ' '.repeat(maxKeyLength - key.length - 1) + pp(value))
    }
    for (var key of (keys || Object.keys(obj).sort())) {
      let value = obj[key]
      if (Array.isArray(value)) {
        if (value.length > 0) {
          logKeyValue(key, value[0])
          for (var e of value.slice(1)) {
            this.log(' '.repeat(maxKeyLength) + pp(e))
          }
        }
      } else if (value !== null && value !== undefined) {
        logKeyValue(key, value)
      }
    }
  }

  this.inspect = obj => console.dir(obj, {colors: true})
}

module.exports = output
