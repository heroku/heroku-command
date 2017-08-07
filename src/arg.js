// @flow

import type Output from './output'
import type {Completion} from './completion'

export type Arg = {
  name: string,
  description?: string,
  required?: boolean,
  optional?: boolean,
  hidden?: boolean,
  completion?: ?Completion
}
