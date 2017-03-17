// @flow

import type Command from '../command' // eslint-disable-line
import {ValueFlag} from '../flag'

export default class OrgFlag extends ValueFlag {
  static char = 'o'
  static description = 'organization to use'
  static default = () => Promise.resolve(process.env.HEROKU_ORGANIZATION)

  get name (): ?string { return this.value }
}
