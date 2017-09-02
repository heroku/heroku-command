// @flow

import Base from '../command'
import {flags} from '.'

let numParser = async function (n: ?string): Promise<number> {
  let m = parseInt(n)
  return m * m
}

let stringParser = function (s: ?string): ?string {
  if (s) return s + '_bar'
}

class Command extends Base {
  static flags = {
    foo: flags.number({required: true, parse: numParser}),
    bar: flags.string({required: true, parse: stringParser})
  }
}

test('uses custom flag parse', async () => {
  const cmd = await Command.mock('--foo', '3', '--bar=bar')
  expect(cmd.flags.foo).toEqual(9)
  expect(cmd.flags.bar).toEqual('bar_bar')
})
