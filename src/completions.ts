import { Config } from 'cli-engine-config'

export type CompletionContext = {
  args?: { [name: string]: string }
  flags?: { [name: string]: string }
  argv?: string[]
  config: Config
}

export type Completion = {
  skipCache?: boolean
  cacheDuration?: number
  cacheKey?: (ctx: CompletionContext) => Promise<string>
  options: (ctx: CompletionContext) => Promise<string[]>
}
