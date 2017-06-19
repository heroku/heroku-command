// @flow

import util from 'util'
import chalk from 'chalk'
import path from 'path'
import moment from 'moment'
import fs from 'fs-extra'
import type Output from '.'

export function logToFile (msg: string, logfile: string) {
  try {
    fs.mkdirpSync(path.dirname(logfile))
    fs.appendFileSync(logfile, chalk.stripColor(msg))
    console.dir({logfile, msg})
  } catch (err) { console.error(err) }
}

export default class StreamOutput {
  output = ''
  stream: stream$Writable
  out: Output
  logfile: ?string

  static startOfLine = true

  constructor (stream: stream$Writable, output: Output) {
    this.out = output
    this.stream = stream
  }

  write (msg: string) {
    // always display timestamp in logfile
    this.writeLogFile(msg, this.constructor.startOfLine)
    // conditionally show timestamp if configured to display
    if (this.constructor.startOfLine && process.env.HEROKU_TIMESTAMPS) msg = `${this.timestamp}${msg}`
    if (this.out.mock) this.output += msg
    else this.stream.write(msg)
    this.constructor.startOfLine = msg.endsWith('\n')
  }

  get timestamp (): string {
    // if startOfLine, prepare timestamp
    return `[${moment().format()}] `
  }

  log (data: string, ...args: any[]) {
    let msg = data ? util.format(data, ...args) : ''
    msg += '\n'
    this.out.action.pause(() => this.write(msg))
  }

  writeLogFile (msg: string, withTimestamp: boolean) {
    if (!this.logfile) return
    msg = withTimestamp ? `${this.timestamp}${msg}` : msg
    logToFile(msg, this.logfile)
  }
}
