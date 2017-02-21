// @flow

import pjson from '../package.json'

export type Config = {
  name: string,
  version: string,
  output: {mock: boolean}
}

export const Default = {
  name: pjson.name,
  version: pjson.version,
  output: {mock: false}
}
