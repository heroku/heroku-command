import { Config } from 'cli-engine-config'
import {
  IBooleanFlag,
  IRequiredFlag,
  IOptionalFlag,
  IMultiOptionFlag,
  IOptionFlag,
  FlagBuilder,
  flags as base,
} from 'cli-flags'

export { IBooleanFlag, IRequiredFlag, IOptionalFlag, IMultiOptionFlag }

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

export type withCompletion = { completion?: Completion }
export type CompletionOptionFlag<T> = IOptionFlag<T> & withCompletion

export type FlagBuilder<T> = {
  (options: Partial<IMultiOptionFlag<T>> & { multiple: true }): IMultiOptionFlag<T> & withCompletion
  (options: Partial<IRequiredFlag<T>> & { required: true }): IRequiredFlag<T> & withCompletion
  (options?: Partial<IOptionalFlag<T>>): IOptionalFlag<T> & withCompletion
}

export const flags = {
  ...base,
  option: <T = string>(defaults: Partial<CompletionOptionFlag<T>> = {}): FlagBuilder<T> => {
    return base.option<T>(defaults)
  },
}
