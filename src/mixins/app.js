// @flow

import type Command from '../command' // eslint-disable-line
import type {Flag} from '../flag'

export const AppFlag: Flag = {
  name: 'app',
  char: 'a',
  description: 'app to run command against',
  hasValue: true
}

type Options = {|
  required?: boolean
|}

export default class App {
  cmd: Command
  options: Options

  constructor (cmd: Command, options: Options = {required: false}) {
    this.cmd = cmd
    this.options = options
  }

  get name (): ?string {
    if (typeof this.cmd.flags.app === 'string') return this.cmd.flags.app
    // TODO: read from git remote
    if (this.options.required) throw new Error('No app specified')
  }
}
