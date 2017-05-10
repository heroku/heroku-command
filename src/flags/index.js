// @flow

import type Command from '../command'

type AlphabetUppercase = | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M' | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T' | 'U' | 'V' | 'X' | 'Y' | 'Z'
type AlphabetLowercase = | 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'x' | 'y' | 'z'

export type Flag <T> = {
  char?: ?(AlphabetLowercase | AlphabetUppercase),
  description?: ?string,
  hidden?: ?boolean,
  default?: ?() => (Promise<?T> | ?T),
  required?: ?boolean,
  optional?: ?boolean,
  parse?: ?(?string, ?Command<*>, string) => (Promise<?T> | ?T)
}

export {default as boolean} from './boolean'
export {default as string} from './string'
export {default as number} from './number'
export {AppFlag as app, RemoteFlag as remote} from './app'
export {default as org} from './org'
