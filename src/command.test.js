// @flow

import Base from './command'
import type {ICommand} from 'cli-engine-config'
import {BooleanFlag} from './flags'
import Output from './output'

class Command extends Base {
  static topic = 'foo'
  static command = 'bar'
  static flags = {myflag: BooleanFlag()}
  static args = [{name: 'myarg', required: false}]
}

test('it meets the interface', () => {
  let c: ICommand = Command
  expect(c).toBeDefined()
})

test('shows the ID', () => {
  expect(Command.id).toEqual('foo:bar')
})

test('runs the command', async () => {
  const cmd = await Command.mock()
  expect(cmd.flags).toEqual({})
  expect(cmd.argv).toEqual([])
})

test('parses args', async () => {
  const cmd = await Command.mock('one')
  expect(cmd.flags).toEqual({})
  expect(cmd.argv).toEqual(['one'])
})

test('passes error to output', async () => {
  class Command extends Base {
    run () { throw new Error('oops!') }
  }

  let mockError = jest.fn()
  class ErrOutput extends Output {
    error = mockError
  }

  await Command.run({output: new ErrOutput()})
  expect(mockError).toBeCalled()
})
