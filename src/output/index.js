// @flow
/* globals
   stream$Writable
 */

const util = require('util')
const linewrap = require('../linewrap')

import {errtermwidth} from './screen'
import Action from './action'
import type Command from './command'

function wrap (msg) {
  return linewrap(6,
    errtermwidth, {
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
    return `${util.inspect(err.code)}: ${err.message}`
  } else if (err.message) {
    return err.message
  }
  return err
}

const arrow = process.platform === 'win32' ? '!' : '▸'

class StreamOutput {
  mock = false
  output = ''
  stream: stream$Writable
  cmd: Command

  constructor (stream: stream$Writable, cmd: Command) {
    this.mock = cmd.config.output ? cmd.config.output.mock : false
    this.cmd = cmd
    this.stream = stream
    this.stream.on('error', err => {
      if (err.code !== 'EPIPE') throw err
    })
  }

  write (msg: string) {
    if (this.mock) this.output += msg
    this.stream.write(msg)
  }

  log (data: string, ...args: any[]) {
    this.cmd.action.pause(() => {
      if (this.mock) this.output += util.format(data, ...args)
      else if (arguments.length === 0) console.log()
      else console.log(data, ...args)
    })
  }
}

export default class Output {
  mock = false
  cmd: Command
  action = new Action(this.cmd)
  stdout = new StreamOutput(process.stdout, this.cmd)
  stderr = new StreamOutput(process.stderr, this.cmd)

  constructor (cmd: Command) {
    this.cmd = cmd
  }

  get displaySpinner (): boolean {
    return !!process.stdin.isTTY && !!process.stderr.isTTY && !process.env.CI && process.env.TERM !== 'dumb'
  }

  async done () {
    if (super.done) super.done()
    this.showCursor()
    this.action.stop()
  }

  log (data, ...args: any) { this.stdout.log(data, ...args) }

  styledJSON (obj: any) {
    let json = JSON.stringify(obj, null, 2)
    if (this.supportsColor) {
      let cardinal = require('cardinal')
      let theme = require('cardinal/themes/jq')
      this.log(cardinal.highlight(json, {json: true, theme: theme}))
    } else {
      this.log(json)
    }
  }

  styledHeader (header: string) {
    this.log(this.color.gray('=== ') + this.color.bold(header))
  }

  styledObject (obj: any, keys: string[]) {
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

  /**
   * inspect an object for debugging
   */
  i (obj: any) {
    this.action.pause(() => {
      console.dir(obj, {colors: true})
    })
  }

  debug (obj: string) {
    if (this.debugging) this.action.pause(() => console.log(obj))
  }

  error (err: Error | string) {
    if (typeof err === 'string') err = new Error(err)
    if (this.action.task) this.action.stop(this.cmd.color.bold.red('!'))
    if (this.debugging) console.error(err.stack)
    else console.error(bangify(wrap(getErrorMessage(err)), this.cmd.color.red(arrow)))
  }

  warn (message: Error | string) {
    this.action.pause(() => {
      if (this.debugging) console.trace(`WARNING: ${util.inspect(message)}`)
      else console.error(bangify(wrap(message), this.cmd.color.yellow(arrow)))
    })
  }

  showCursor () {
    const ansi = require('ansi-escapes')
    if (process.stderr.isTTY) process.stderr.write(ansi.cursorShow)
  }
}
