// @flow

import Command from './command'

export default class Parse {
  constructor (cmd: Command) {
    this.cmd = cmd
  }

  cmd: Command
  flags: {[name: string]: string | true} = {}
  args: {[name: string]: string} = {}

  async parse () {
    let args = this.cmd.constructor.args.slice(0)
    let flags = this.cmd.constructor.flags
    let parsingArgs = this.cmd.argv.slice(2)

    async function parseFlags () {
      for (let flag of flags || []) {
        if (this.flags[flag.name]) {
          if (flag.parse) this.flags[flag.name] = flag.parse(this.flags[flag.name], this.cmd)
        } else {
          if (flag.default) this.flags[flag.name] = await flag.default(this.cmd)
          if (!this.flags[flag.name] && (flag.optional === false || flag.required === true)) {
            throw new Error(`Missing required flag --${flag.name}`)
          }
        }
      }
    }

    let parseFlag = arg => {
      let long = arg.startsWith('--')
      let flag = long ? findLongFlag(arg) : findShortFlag(arg)
      if (!flag) return false
      let cur = this.flags[flag.name]
      if (flag.hasValue) {
        if (cur) throw new Error(`Flag --${flag.name} already provided`)
        let val = (long || arg.length < 3) ? parsingArgs.shift() : arg.slice(2)
        if (!val) throw new Error(`Flag --${flag.name} expects a value.`)
        this.flags[flag.name] = val
      } else {
        if (!cur) this.flags[flag.name] = true
        // push the rest of the short characters back on the stack
        if (!long && arg.length > 2) parsingArgs.unshift(`-${arg.slice(2)}`)
      }
      return true
    }

    let findLongFlag = arg => {
      return flags.find(f => f.name === arg.slice(2))
    }

    let findShortFlag = arg => {
      return flags.find(f => f.char === arg[1])
    }

    let parsingFlags = true
    while (parsingArgs.length) {
      let arg = parsingArgs.shift()
      if (parsingFlags && arg.startsWith('-')) {
        if (arg === '--') { parsingFlags = false; continue }
        if (parseFlag(arg)) continue
      }
      // TODO: varargs
      let expected = args.shift()
      if (!expected) throw new Error(`Unexpected argument ${arg}`)
      this.args[expected.name] = arg
    }

    let missingArg = args.find(a => a.optional !== true && a.required !== false)
    if (missingArg) throw new Error(`Missing required argument ${missingArg.name}`)

    await parseFlags.call(this)
  }
}
