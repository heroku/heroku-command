// @flow

import {type OptionFlag} from '.'

type Options = $Shape<OptionFlag<string>>

export default function StringFlag (options: Options = {}): OptionFlag<string> {
  return {
    parse: (input, cmd, name) => input,
    ...options
  }
}
