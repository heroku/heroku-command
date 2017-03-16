// @flow

import {type Arg} from './arg'
import {type Flag} from './flag'

type Options = {
  flags: Flag[],
  args: Arg[],
  variableArgs: boolean,
}

type Output = {
  flags: {[name: string]: string},
  args: {[name: string]: string},
  argv: string[]
}

export default class Parse {
  options: Options
  constructor (options: $Shape<Options>) {
    this.options = {
      flags: options.flags || [],
      args: options.args || [],
      variableArgs: !!options.variableArgs
    }
  }

  flags: {[name: string]: string} = {}
  args: {[name: string]: string} = {}
  argv: string[]

  async parse (...argv: string[]): Promise<Output> {
    let options = this.options
    let output: Output = {
      flags: {},
      args: {},
      argv: []
    }

    async function parseFlags () {
      for (let flag of options.flags) {
        if (!output.flags[flag.name]) {
          if (flag.default) output.flags[flag.name] = await flag.default()
          if (!output.flags[flag.name] && (flag.optional === false || flag.required === true)) {
            throw new Error(`Missing required flag --${flag.name}`)
          }
        }
      }
    }

    let parseFlag = arg => {
      let long = arg.startsWith('--')
      let flag = long ? findLongFlag(arg) : findShortFlag(arg)
      if (!flag) {
        const i = arg.indexOf('=')
        if (i !== -1) {
          argv.unshift(arg.slice(i + 1))
          return parseFlag(arg.slice(0, i))
        }
        return false
      }
      let cur = output.flags[flag.name]
      if (flag.hasValue) {
        if (cur) throw new Error(`Flag --${flag.name} already provided`)
        let val
        if (long || arg.length < 3) val = argv.shift()
        else val = arg.slice(arg[2] === '=' ? 3 : 2)
        if (!val) throw new Error(`Flag --${flag.name} expects a value.`)
        output.flags[flag.name] = val
      } else {
        if (!cur) output.flags[flag.name] = flag.name
        // push the rest of the short characters back on the stack
        if (!long && arg.length > 2) argv.unshift(`-${arg.slice(2)}`)
      }
      return true
    }

    let findLongFlag = arg => {
      return options.flags.find(f => f.name === arg.slice(2))
    }

    let findShortFlag = arg => {
      return options.flags.find(f => f.char === arg[1])
    }

    let parsingFlags = true
    while (argv.length) {
      let arg = argv.shift()
      if (parsingFlags && arg.startsWith('-')) {
        if (arg === '--') { parsingFlags = false; continue }
        if (parseFlag(arg)) continue
      }
      output.argv.push(arg)
      let expected = options.args.shift()
      if (expected) output.args[expected.name] = arg
      else if (!options.variableArgs) throw new Error(`Unexpected argument ${arg}`)
    }

    const missingArg = options.args.find(a => a.optional !== true && a.required !== false && !output[a.name])
    if (missingArg) throw new Error(`Missing required argument ${missingArg.name}`)

    await parseFlags()
    return output
  }
}
