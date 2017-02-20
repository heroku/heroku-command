// @flow

type Config = {
  name: string,
  version: string
}

export default class Base {
  config: Config

  constructor (options: {config: Config}) {
    this.config = options.config
  }
}
