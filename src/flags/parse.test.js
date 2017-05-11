// @flow

import Base from '../command'
import NumberFlag from './string'

let flagParser = function (n: ?string) : Promise<> {
  let m = parseInt(n)
  return new Promise(resolve => resolve(m * m))
}

class Command extends Base {
  static flags = {foo: NumberFlag({required: true, parse: flagParser})}
}

test('uses custom flag parse', async () => {
  const cmd = await Command.mock('--foo', '3')
  expect(cmd.flags.foo).toBe(9)
  expect(cmd.flags.foo).not.toEqual('9')
})
