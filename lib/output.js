'use strict'

const slack = Symbol('slack')
const stdout = Symbol('stdout')
const stderr = Symbol('stderr')
const util = require('util')
const linewrap = require('./linewrap')
const screen = require('./screen')

function epipe (fn) {
  try {
    fn()
  } catch (err) {
    if (err !== 'EPIPE') throw err
  }
}

function wrap (msg) {
  return linewrap(6,
    screen.errtermwidth(), {
      skipScheme: 'ansi-color',
      skip: /^\$ .*$/
    })(msg || '')
}

function bangify (msg, c) {
  let lines = msg.split('\n')
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i]
    lines[i] = ' ' + c + line.substr(2, line.length)
  }
  return lines.join('\n')
}

function getErrorMessage (err) {
  if (err.body) {
    // API error
    if (err.body.message) {
      return err.body.message
    } else if (err.body.error) {
      return err.body.error
    }
  }
  // Unhandled error
  if (err.message && err.code) {
    return `${err.code}: ${err.message}`
  } else if (err.message) {
    return err.message
  }
  return err
}

const arrow = process.platform === 'win32' ? '!' : '▸'

module.exports = () => {
  return Base => class extends Base {
    constructor (options) {
      super(options)
      if (options.mock) {
        this[stdout] = []
        this[stderr] = []
      }
      if (options.slack) this[slack] = []

      this.action = message => {
        if (!this.displayAction) this.writeError(`${message}...`)
        else if (this.action.spinner) {
          this.action.spinner.text = `${message}...`
        } else {
          const Spinner = require('./spinner')
          this.action.spinner = new Spinner({text: `${message}...`, command: this})
          this.action.spinner.start()
        }
      }

      this.action.status = status => {
        if (this.action.spinner) this.action.spinner.status = status
      }

      this.action.done = (msg = 'done') => {
        if (this.action.spinner) {
          this.action.spinner.stop(msg)
        } else {
          if (this.slack) return this.log(msg)
        }
        this.action.spinner = null
      }

      this.action.pause = fn => {
        if (this.action.spinner) {
          this.action.spinner.stop()
          this.action.spinner.clear()
        }
        fn()
        if (this.action.spinner) {
          process.stderr.write('\n')
          this.action.spinner.start()
        }
      }
    }

    get displayAction () {
      return !this[slack] && process.stdin.isTTY && process.stderr.isTTY && !process.env.CI && process.env.TERM !== 'dumb'
    }

    get stdout () {
      return this[stdout].join('\n')
    }

    get stderr () {
      return this[stderr].join('\n')
    }

    async done () {
      if (super.done) super.done()
      this.showCursor()
      if (this.action.spinner) this.action.done()
      if (this[slack]) {
        const slack = require('./slack')
        slack.respond({
          text: `\`/heroku ${this[slack].join('\n')}\``,
          attachments: [
            {
              text: '```' + this[slack].join('\n') + '```',
              mrkdwn_in: ['text']
            }
          ]
        }, this[slack].join('\n'))
      }
    }

    log (data, ...args) {
      epipe(() => {
        this.action.pause(() => {
          if (this[stdout]) this[stdout].push(util.format(data, ...args))
          else if (this[slack]) this[slack].push(util.format(data, ...args))
          else if (arguments.length === 0) console.log()
          else console.log(data, ...args)
        })
      })
    }

    write (msg) {
      epipe(() => {
        if (this[slack]) this[slack].push(msg)
        else process.stdout.write(msg)
      })
    }

    writeError (msg) {
      epipe(() => {
        if (this[slack]) this[slack].push(msg)
        else process.stderr.write(msg)
      })
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
      this.action.pause(() => console.dir(obj, {colors: true}))
    }

    debug (obj) {
      if (this.debugging) this.action.pause(() => console.log(obj))
    }

    error (err) {
      epipe(() => {
        if (typeof err === 'string') {
          this.action.pause(() => {
            if (this[stderr]) this[stderr].push(err)
            else if (this[slack]) this[slack].push(err)
            else console.error(err)
          })
        } else {
          if (this.action.spinner) this.action.done(this.color.bold.red('!'))
          if (this.debugging) console.error(err.stack)
          else console.error(bangify(wrap(getErrorMessage(err)), this.color.red(arrow)))
        }
      })
    }

    warn (message) {
      epipe(() => {
        this.action.pause(() => {
          if (this.debugging) console.trace(`WARNING: ${message}`)
          else console.error(bangify(wrap(message), this.color.yellow(arrow)))
        })
      })
    }

    showCursor () {
      const ansi = require('ansi-escapes')
      if (process.stderr.isTTY) process.stderr.write(ansi.cursorShow)
    }
  }
}
