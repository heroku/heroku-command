// @flow

import Command from '../command'
import NumberFlag from './number'

class MyCommand extends Command<*> {
  static flags = { foo: NumberFlag() }
  foo: ?number
  async run() {
    this.foo = this.flags.foo
  }
}

test('has a number', async () => {
  const cmd = await MyCommand.mock('--foo', '1337')
  expect(cmd.foo).toEqual(1337)
})
