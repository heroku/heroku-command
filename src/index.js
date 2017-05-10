// @flow

import {boolean, string, number, app, remote} from './flags'

export {default} from './command'
export {default as Topic} from './topic'
export type {Flag} from './flags'
export type {Arg} from './arg'
export const flags = {boolean, string, number, remote, app}
