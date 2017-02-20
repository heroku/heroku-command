export default Base => class extends Base {
  async init () {
    if (super.init) await super.init()
    let args = (this.constructor.args || []).slice(0)
    let flags = this.constructor.flags || []
    let parsingArgs = this.argv.slice(2)

    async function parseFlags () {
      for (let flag of flags || []) {
        if (this.flags[flag.name]) {
          if (flag.parse) this.flags[flag.name] = flag.parse.bind(this)(this.flags[flag.name])
        } else {
          if (flag.default) this.flags[flag.name] = await flagDefault(flag)
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
        // if flag is specified multiple times, increment
        if (!cur) this.flags[flag.name] = 0
        this.flags[flag.name]++

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

    let flagDefault = flag => {
      let val = typeof flag.default === 'function' ? flag.default.bind(this)() : flag.default
      return Promise.resolve(val)
    }

    let parsingFlags = true
    this.flags = {}
    this.args = this.constructor.variableArgs ? [] : {}
    while (parsingArgs.length) {
      let arg = parsingArgs.shift()
      if (parsingFlags && arg.startsWith('-')) {
        if (arg === '--') { parsingFlags = false; continue }
        if (parseFlag(arg)) continue
      }
      if (this.constructor.variableArgs) {
        this.args.push(arg)
      } else {
        let expected = args.shift()
        if (!expected) throw new Error(`Unexpected argument ${arg}`)
        this.args[expected.name] = arg
      }
    }

    let missingArg = args.find(a => a.optional !== true && a.required !== false)
    if (missingArg) throw new Error(`Missing required argument ${missingArg.name}`)

    await parseFlags.call(this)
  }
}
