// @flow

import type Output from './output'
import type {Completion as CompletionBase} from 'cli-engine-config'

type CompletionContext = {
  args?: ?{[name: string]: string},
  flags?: ?{[name: string]: string},
  argv?: ?string[],
  out: Output
}

export type Completion = CompletionBase<CompletionContext>
