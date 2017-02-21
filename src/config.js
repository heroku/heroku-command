// @flow

export type PJSON = {
  name: string,
  version: string
}

export type ConfigOptions = {
  name?: string,
  version?: string,
  argv0?: string,
  mock?: boolean,
  pjson?: PJSON,
  debug?: number,
  argv?: string[]
}

function debugging () {
  const HEROKU_DEBUG = process.env.HEROKU_DEBUG
  if (HEROKU_DEBUG === 'true') return 1
  if (HEROKU_DEBUG) return parseInt(HEROKU_DEBUG)
  return 0
}

export default class Config {
  constructor (options: ConfigOptions) {
    this.pjson = options.pjson || require('../package.json')
    this.name = options.name || this.pjson.name
    this.version = options.version || this.pjson.version
    this.argv0 = options.argv0 || process.argv[0]
    this.argv = options.argv || process.argv
    this.mock = options.mock || false
    this.debugging = options.debug || debugging()
  }

  name: string
  version: string
  argv0: string
  argv: string[]
  mock: boolean
  pjson: PJSON
  debugging: number
}
