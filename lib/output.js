'use strict'

module.exports = () => {
  return Base => class extends Base {
    log (...args) {
      if (this.slack) this._output += `${args.join('\n')}\n'`
      else console.log(...args)
    }

    get write () {
      if (this._write) return this._write
      this._write = (...args) => {
        if (this.slack) this._output += args.join(' ')
        else process.stdout.write(...args)
      }
      this._write.error = (...args) => {
        if (this.slack) this.write(...args)
        else process.stderr.write(...args)
      }
      return this._write
    }

    styledJSON (obj) {
      let json = JSON.stringify(obj, null, 2)
      if (this.supportsColor) {
        let cardinal = require('cardinal')
        let theme = require('cardinal/themes/jq')
        this.log(cardinal.highlight(json, {json: true, theme: theme}))
      } else {
        this.log(json)
      }
    }

    styledHeader (header) {
      this.log(this.color.gray('=== ') + this.color.bold(header))
    }

    styledObject (obj, keys) {
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

    inspect (obj) {
      console.dir(obj, {colors: true})
    }

    get action () {
      if (this._action) return this._action
      this.action = function (message, options, promise) {
        const Spinner = require('./spinner')

        let start = (message, options) => {
          if (!options) options = {}
          module.exports.task = {
            spinner: new Spinner({spinner: options.spinner, text: `${message}...`, command: this}),
            stream: options.stream
          }
          if (this.slack) return this.write(`${message}... `)
          module.exports.task.spinner.start()
        }

        if (options.then) [options, promise] = [{}, options]
        start(message, options)
        return promise.then(result => {
          if (options.success !== false) this.action.done(options.success || 'done', options)
          else this.action.done(null, options)
          return result
        }).catch(err => {
          if (err.body && err.body.id === 'two_factor') this.action.done(this.color.yellow.bold('!'), options)
          else this.action.done(this.color.red.bold('!'), options)
          throw err
        })
      }

      this.action.warn = msg => {
        let task = module.exports.task
        if (task) task.spinner.warn(msg)
        else this.warn(msg)
      }

      this.action.status = status => {
        let task = module.exports.task
        if (task) task.spinner.status = status
      }

      this.action.done = (msg, options) => {
        options = options || {}
        let task = module.exports.task
        if (task) {
          module.exports.task = null
          if (this.slack) return this.log(msg)
          task.spinner.stop(msg)
          if (options.clear) task.spinner.clear()
        }
      }
      return this._action
    }
  }
}
