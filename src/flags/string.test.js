// @flow

import Command from '../command'
import StringFlag from './string'

class MyCommand extends Command<*> {
  static flags = {foo: StringFlag()}
  foo: ?string
  async run () {
    this.foo = this.flags.foo
  }
}

test('has a string', async () => {
  const cmd = await MyCommand.mock('--foo', 'bar')
  expect(cmd.foo).toEqual('bar')
})
