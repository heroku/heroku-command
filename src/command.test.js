// @flow

import Base from './command'
import {type ICommand, buildConfig} from 'cli-engine-config'
import {flags as Flags} from './flags'
import Output from './output'

class Command extends Base {
  static topic = 'foo'
  static command = 'bar'
  static flags = {myflag: Flags.boolean()}
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
  expect(cmd.args).toEqual({myarg: 'one'})
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

test('has help', async () => {
  class Command extends Base {
    static topic = 'config'
    static command = 'get'
    static help = `this is

some multiline help
`
  }
  let config = buildConfig()
  expect(Command.buildHelp(config)).toEqual(`
Usage: cli-engine config:get

this is

some multiline help\n`)
  expect(Command.buildHelpLine(config)).toEqual(['config:get', undefined])
})
