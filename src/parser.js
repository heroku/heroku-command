// @flow

import {type Arg} from './arg'
import {ValueFlag, type Flag} from './flag'

type Options <Flags> = {
  flags: Flags,
  args: Arg[],
  variableArgs: boolean,
}

export type ArgsOutput <Flags> = {
  flags: {},
  args: {[name: string]: string},
  argv: string[]
}

const isClass = (a, b) => a === b || a.prototype instanceof b

export default class Parse <FlagsInput: {[name: string]: *}, FlagsOutput: {[name: string]: *}> {
  options: Options<FlagsInput>
  constructor (options: $Shape<Options<FlagsInput>>) {
    this.options = {
      flags: options.flags || {},
      args: options.args || [],
      variableArgs: !!options.variableArgs
    }
  }

  async parse (...argv: string[]): Promise<ArgsOutput<FlagsOutput>> {
    let options = this.options
    options.args = options.args.slice(0)
    let output: ArgsOutput<FlagsOutput> = {
      flags: {},
      args: {},
      argv: []
    }

    async function parseFlags () {
      for (const [name, Flag] of entries(options.flags)) {
        let flag = output.flags[name]
        if (!flag) flag = output.flags[name] = new Flag()
        if (!(flag instanceof ValueFlag)) return
        await flag.parse()
        if (!output.flags[name] && flag.constructor.required) {
          throw new Error(`Missing required flag --${name}`)
        }
      }
    }

    let parseFlag = arg => {
      let long = arg.startsWith('--')
      let name = long ? findLongFlag(arg) : findShortFlag(arg)
      if (!name) {
        const i = arg.indexOf('=')
        if (i !== -1) {
          argv.unshift(arg.slice(i + 1))
          return parseFlag(arg.slice(0, i))
        }
        return false
      }
      let Flag = options.flags[name]
      let cur = output.flags[name]
      if (isClass(Flag, ValueFlag)) {
        // TODO: handle multiple flags
        if (cur) throw new Error(`Flag --${name} already provided`)
        let val
        if (long || arg.length < 3) val = argv.shift()
        else val = arg.slice(arg[2] === '=' ? 3 : 2)
        if (!val) throw new Error(`Flag --${name} expects a value`)
        output.flags[name] = new Flag(val)
      } else {
        if (!cur) output.flags[name] = new Flag()
        // push the rest of the short characters back on the stack
        if (!long && arg.length > 2) argv.unshift(`-${arg.slice(2)}`)
      }
      return true
    }

    let findLongFlag = arg => {
      let name = arg.slice(2)
      if (options.flags[name]) return name
    }

    let findShortFlag = arg => {
      for (let k of Object.keys(options.flags)) {
        if (options.flags[k].char === arg[1]) return k
      }
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

    const missingArg = options.args.find(a => a.required && !output.args[a.name])
    if (missingArg) throw new Error(`Missing required argument ${missingArg.name}`)

    await parseFlags()
    return output
  }
}

function entries <T> (obj: {[k: string]: T}): [string, T][] {
  let entries = []
  for (let k of Object.keys(obj)) {
    entries.push([k, obj[k]])
  }
  return entries
}
