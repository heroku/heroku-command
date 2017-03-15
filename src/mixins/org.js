// @flow

import type Command from '../command' // eslint-disable-line
import type {Flag} from '../flag'

export const OrgFlag: Flag = {
  name: 'org',
  char: 'o',
  description: 'organization to use',
  hasValue: true
}

type Options = {
  required?: ?boolean
}

export default class Org {
  cmd: Command
  options: Options

  constructor (cmd: Command, options: Options = {required: false}) {
    this.cmd = cmd
    this.options = options
  }

  get name (): ?string {
    if (typeof this.cmd.flags.org === 'string') return this.cmd.flags.org
    if (this.options.required) throw new Error('No org specified')
  }
}
