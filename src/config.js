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
  pjson?: PJSON
}

export default class Config {
  constructor (options: ConfigOptions) {
    this.pjson = options.pjson || require('../package.json')
    this.name = options.name || this.pjson.name
    this.version = options.version || this.pjson.version
    this.argv0 = options.argv0 || process.argv[0]
    this.mock = options.mock || false
  }

  name: string
  version: string
  argv0: string
  mock: boolean
  pjson: PJSON
}
