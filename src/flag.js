// @flow

type AlphabetUppercase = | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M' | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T' | 'U' | 'V' | 'X' | 'Y' | 'Z'
type AlphabetLowercase = | 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'x' | 'y' | 'z'

type FlagOptions = {
  char?: AlphabetLowercase | AlphabetUppercase,
  description?: string,
  hidden?: boolean
}

export class Flag {
  static char: ?(AlphabetLowercase | AlphabetUppercase)
  static description: ?string
  static hidden = false

  static with (options: $Shape<FlagOptions>) {
    return class Flag extends this {
      static char = options.char
      static description = options.description
      static hidden = !!options.hidden
    }
  }

  //value = true
}

type ValueFlagOnlyOptions = {
  optional?: boolean,
  required?: boolean
}

type ValueFlagOptions = ValueFlagOnlyOptions & FlagOptions

export class ValueFlag extends Flag {
  static default: ?() => Promise<?string>
  static required = false

  static with (options: $Shape<ValueFlagOptions>) {
    return class ValueFlag extends this {
      static char = options.char
      static description = options.description
      static hidden = !!options.hidden
      static required = options.optional === false || !!options.required
    }
  }

  input: ?string
  value: ?string

  constructor (input: ?string) {
    super()
    this.input = input
  }

  async parse () {
    this.value = this.input
    if (!this.value && this.constructor.default) this.value = await this.constructor.default()
  }
}
