// @flow

import Base from './command'
import {BooleanFlag} from './flag'

class Command extends Base {
  static flags = {myflag: BooleanFlag()}
  static args = [{name: 'myarg', required: false}]
}

test('runs the command', async () => {
  const cmd = await Command.mock()
  expect(cmd.args).toEqual({})
  expect(cmd.flags).toEqual({})
  expect(cmd.argv).toEqual([])
})

test('parses args', async () => {
  const cmd = await Command.mock(['one'])
  expect(cmd.args).toEqual({myarg: 'one'})
  expect(cmd.flags).toEqual({})
  expect(cmd.argv).toEqual(['one'])
})

test('handles error', async () => {
  class Command extends Base {
    run () { throw new Error('oops!') }
  }
  // flow$ignore
  Command.prototype.error = jest.fn()
  await Command.run([])
  expect(Command.prototype.error.mock.calls[0][0]).toMatchObject({message: 'oops!'})
})
