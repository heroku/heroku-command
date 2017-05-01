// @flow

import {type Flag} from '.'

type Options = $Shape<Flag<string>>
export default function TeamFlag (options: Options = {}, env: typeof process.env = process.env): Flag<string> {
  // still support the old env variable
  const envTeam = env.HEROKU_TEAM || env.HEROKU_ORGANIZATION
  const defaultOptions: Options = {
    char: 't',
    description: 'team to use',
    default: () => envTeam,
    parse: (input) => {
      if (input) return input
      if (envTeam) return envTeam
      if (options.required) throw new Error('No team specified')
    }
  }
  return Object.assign(defaultOptions, options)
}
