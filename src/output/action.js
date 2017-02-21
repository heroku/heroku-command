// @flow

import type Spinner from './spinner'
import type Output from '.'

type Task = {
  spinner?: Spinner,
  status: string,
  message: string
}

export default class Action {
  out: Output
  task: ?Task = null

  constructor (out: Output) {
    this.out = out
  }

  start (message: string, status: string = '') {
    const msg = `${message}...`
    if (this.task) {
      if (this.task.spinner) {
        this.task.spinner.text = msg
        this.task.spinner.status = status
      } else process.stderr.write(`\n${msg} ${status}`)
    } else {
      this.task = ({message, status}: Task)
      if (this.displaySpinner) {
        const Spinner = require('./spinner')
        this.task.spinner = new Spinner({text: msg, command: this.out, status})
        this.task.spinner.start()
      } else this.out.stderr.write(`${msg} ${status}`)
    }
  }

  stop (msg: string = 'done') {
    if (!this.task) return
    this.start(this.task.message, msg)
    if (this.task && this.task.spinner) this.task.spinner.stop(msg)
    else process.stderr.write('\n')
    delete this.task
  }

  pause (fn: Function) {
    let spinner = this.task ? this.task.spinner : null
    if (spinner) {
      if (spinner) {
        spinner.stop()
        spinner.clear()
      } else {
        delete this.task
        process.stderr.write('\n')
      }
    }
    fn()
    if (spinner) {
      process.stderr.write('\n')
      spinner.start()
    }
  }
}
