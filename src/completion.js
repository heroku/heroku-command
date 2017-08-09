// @flow

import type Output from './output'

type CompletionContext = {
  args: ?{[name: string]: string},
  flag: ?{[name: string]: string},
  argv: ?string[],
  out: Output
}

export type Completion = {
  cacheDuration?: ?number,
  cacheKey?: ?(CompletionContext) => Promise<string>,
  options: (CompletionContext) => Promise<string[]>
}
