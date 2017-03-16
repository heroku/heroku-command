// @flow

import type Command from './command'

export type Flag = {
  name: string,
  char?: string,
  description?: string,
  hidden?: boolean,
  optional?: boolean,
  required?: boolean,
  // TODO: BooleanFlag etc
  default?: () => Promise<string>
}
