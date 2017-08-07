// @flow

import type Output from './output'

type CompletionContext = {
  args: ?{string: ?string}[],
  flags: ?{string: ?string}[],
  argv: string[],
  output: Output
}

export type Completion = {
  cacheDuration?: ?number,
  cacheKey?: ?string,
  cacheContext?: (CompletionContext) => Promise<string>,
  options: (CompletionContext) => Promise<string[]>
}
