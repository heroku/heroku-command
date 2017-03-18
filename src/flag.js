// @flow

import type Command from './command'

type AlphabetUppercase = | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M' | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T' | 'U' | 'V' | 'X' | 'Y' | 'Z'
type AlphabetLowercase = | 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'x' | 'y' | 'z'

export type IFlag <T> = {
  char?: AlphabetLowercase | AlphabetUppercase,
  description?: string,
  hidden?: boolean,
  default?: () => (Promise<?T> | ?T),
  required?: boolean,
  optional?: boolean,
  parse?: (?string, ?Command<*>) => (Promise<?T> | ?T)
}

export function Flag <T> (options: $Shape<IFlag<T>> = {}): IFlag<T> {
  const defaultOptions: $Shape<IFlag<T>> = { hidden: false }
  return Object.assign(defaultOptions, options)
}

export function BooleanFlag (options: $Shape<IFlag<boolean>> = {}): IFlag<boolean> {
  return Flag(options)
}

export function StringFlag (options: $Shape<IFlag<string>> = {}): IFlag<string> {
  const defaultOptions: $Shape<IFlag<string>> = {
    parse: (input) => {
      let value = input
      if (!value && options.default) value = options.default
      if (!value && options.required) throw new RequiredFlagError('name goes here')
      return input
    }
  }
  return Flag(Object.assign(defaultOptions, options))
}

export class RequiredFlagError extends Error {
  constructor (name: string) {
    super(`Missing required flag --${name}`)
  }
}
