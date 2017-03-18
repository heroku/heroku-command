// @flow

import {type Arg} from './arg'
import {type IFlag} from './flag'
import type Command from './command'

export type InputFlags = {[name: string]: IFlag<*>}
export type Input <Flags: InputFlags> = {
  flags: Flags,
  args: Arg[],
  variableArgs: boolean,
  cmd?: Command<Flags>
}

export type OutputFlags <Flags: InputFlags> = {[name: $Enum<Flags>]: *}
export type OutputArgs = {[name: string]: string}

export type Output <Flags> = {
  flags: OutputFlags<Flags>,
  args: OutputArgs,
  argv: string[]
}

export default class Parse <Flags: InputFlags> {
  input: Input<Flags>
  constructor (input: Input<Flags>) {
    this.input = input
  }

  async parse (...argv: string[]): Promise<Output<Flags>> {
    let input = this.input
    let output: Output<Flags> = ({
      flags: {},
      args: {},
      argv: []
    })

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
      let flag = input.flags[name]
      let cur = output.flags[name]
      if (flag.parse) {
        // TODO: handle multiple flags
        if (cur) throw new Error(`Flag --${name} already provided`)
        let input
        if (long || arg.length < 3) input = argv.shift()
        else input = arg.slice(arg[2] === '=' ? 3 : 2)
        if (!input) throw new Error(`Flag --${name} expects a value`)
        output.flags[name] = flag.parse(input, this.input.cmd)
      } else {
        if (!cur) output.flags[name] = true
        // push the rest of the short characters back on the stack
        if (!long && arg.length > 2) argv.unshift(`-${arg.slice(2)}`)
      }
      return true
    }

    let findLongFlag = arg => {
      let name = arg.slice(2)
      if (input.flags[name]) return name
    }

    let findShortFlag = arg => {
      for (let k of Object.keys(input.flags)) {
        if (input.flags[k].char === arg[1]) return k
      }
    }

    let parsingFlags = true
    let argIndex = 0
    while (argv.length) {
      let arg = argv.shift()
      if (parsingFlags && arg.startsWith('-')) {
        // attempt to parse as flag
        if (arg === '--') { parsingFlags = false; continue }
        if (parseFlag(arg)) continue
        // not actually a flag if it reaches here so parse as an arg
      }
      // not a flag, parse as arg
      output.argv.push(arg)
      let expected = input.args[argIndex++]
      if (expected) output.args[expected.name] = arg
      else if (!input.variableArgs) throw new Error(`Unexpected argument ${arg}`)
    }

    const missingArg = input.args.find(a => a.required && !output.args[a.name])
    if (missingArg) throw new Error(`Missing required argument ${missingArg.name}`)

    for (let name of Object.keys(input.flags)) {
      if (!output.flags[name] && input.flags[name].parse) {
        output.flags[name] = await input.flags[name].parse()
      }
    }
    return output
  }
}
