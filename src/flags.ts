import deps from './deps'
import { Config } from 'cli-engine-config'
import { flags } from 'cli-flags'

export interface CompletionContext {
  args?: { [name: string]: string }
  flags?: { [name: string]: string }
  argv?: string[]
  config: Config
}

export interface Completion {
  skipCache?: boolean
  cacheDuration?: number
  cacheKey?: (ctx: CompletionContext) => Promise<string>
  options: (ctx: CompletionContext) => Promise<string[]>
}

export interface IOptionFlag<T = string> extends flags.IOptionFlag<T> {
  completion?: Completion
}

export type IFlag<T = string> = flags.IBooleanFlag | IOptionFlag<T>

export type Input = { [k: string]: IFlag<any> }

export type Definition<T = string> = (options?: Partial<IOptionFlag<T>>) => IOptionFlag<T>

export function option<T = string>(defaults: Partial<IOptionFlag<T>> = {}): Definition<T> {
  return deps.CLIFlags.flags.option<T>(defaults)
}

export function string(defaults: Partial<IOptionFlag> = {}): IOptionFlag {
  return deps.CLIFlags.flags.string(defaults)
}

export { boolean } from 'cli-flags/lib/flags'
