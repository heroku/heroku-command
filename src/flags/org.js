// @flow

import {Flag, type IFlag} from '../flag'

type Options = $Shape<IFlag<string>>
export default function OrgFlag (options: Options = {}, env: typeof process.env = process.env): IFlag<string> {
  const envOrg = env.HEROKU_ORGANIZATION
  const defaultOptions: Options = {
    char: 'o',
    description: 'organization to use',
    default: () => envOrg,
    parse: (input) => {
      if (input) return input
      if (envOrg) return envOrg
      if (options.required) throw new Error('No org specified')
    }
  }
  return Flag(Object.assign(defaultOptions, options))
}
