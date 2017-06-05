// @flow

import type Output from '.'

export function shouldDisplaySpinner (out: Output) {
  return !out.mock && !out.config.debug && !!process.stdin.isTTY && !!process.stderr.isTTY && !process.env.CI && process.env.TERM !== 'dumb'
}

type Task = {
  action: string,
  status: ?string,
  active: ?boolean
}

export class ActionBase {
  task: ?Task

  start (action: string, status: ?string) {
    const task = this.task = {action, status, active: false}
    this._start()
    task.active = true
  }

  stop (msg: string = 'done') {
    const task = this.task
    if (!task) return
    this.status = msg
    this._stop()
    task.active = false
    delete this.task
  }

  get status (): ?string { return this.task ? this.task.status : undefined }
  set status (status: string) {
    const task = this.task
    if (!task) return
    task.status = status
    this._start()
  }

  pause (fn: Function, icon: ?string) {
    const task = this.task
    const active = task && task.active
    const prevStatus = task ? task.status : null
    if (task && active) {
      if (icon) {
        this.status = task.status ? `${icon} ${task.status}` : `${icon}`
      }
      this._stop()
      task.active = false
    }
    fn()
    if (task && active) {
      this.start(task.action, prevStatus)
    }
  }

  _start () { throw new Error('not implemented') }
  _stop () { throw new Error('not implemented') }
}

export class SimpleAction extends ActionBase {
  out: Output
  previous: {action: string, status: ?string}

  constructor (out: Output) {
    super()
    this.out = out
  }

  _start () {
    this._render()
  }

  _stop () {
    this._write('\n')
    delete this.previous
  }

  _render () {
    const task = this.task
    if (!task) return
    if (task.status && this.previous && this.previous.action === task.action && !this.previous.status) {
      // just append status to end if there wasn't a status before
      this._write(` ${task.status}`)
    } else {
      if (this.previous) this._write('\n')
      this._write(task.status ? `${task.action}... ${task.status}` : `${task.action}...`)
    }
    this.previous = {action: task.action, status: task.status}
  }

  _write (s: string) {
    this.out.stderr.write(s)
  }
}

export class SpinnerAction extends ActionBase {
  out: Output
  spinner: number
  ansi: any
  frames: any
  frameIndex: number
  output: ?string
  width: number

  constructor (out: Output) {
    super()
    this.out = out
    this.ansi = require('ansi-escapes')
    this.frames = require('./spinners.js')[process.platform === 'win32' ? 'line' : 'dots2'].frames
    this.frameIndex = 0
    const screen = require('./screen')
    this.width = screen.errtermwidth
  }

  _start () {
    this._reset()
    this.output = null
    if (this.spinner) clearInterval(this.spinner)
    this._render()
    let interval: any = this.spinner = setInterval(this._render.bind(this), 100, true)
    interval.unref()
  }

  _stop () {
    clearInterval(this.spinner)
    this._render(false)
    this.output = null
  }

  _render (spin: ?boolean) {
    const task = this.task
    if (!task) return
    this._reset()
    let frame = spin ? ` ${this._frame()}` : ''
    let status = task.status ? ` ${task.status}` : ''
    this.output = `${task.action}...${frame}${status}\n`
    this._write(this.output)
  }

  _reset () {
    if (!this.output) return
    let lines = this._lines(this.output)
    this._write(this.ansi.cursorLeft +
      this.ansi.cursorUp(lines) +
      this.ansi.eraseDown)
  }

  _frame (): string {
    let frame = this.frames[this.frameIndex]
    this.frameIndex = ++this.frameIndex % this.frames.length
    return this.out.color.heroku(frame)
  }

  _lines (s: string): number {
    return this.out.color.stripColor(s)
      .split('\n')
      .map(l => Math.ceil(l.length / this.width))
      .reduce((c, i) => c + i, 0)
  }

  _write (s: string) {
    this.out.stderr.write(s)
  }
}
