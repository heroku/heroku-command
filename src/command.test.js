// @flow

import Base from './command'

class Command extends Base {
  static flags = [{name: 'myflag', required: false}]
  static args = [{name: 'myarg', required: false}]

  run () {
    this.log('foo')
    if (this.args.myarg) this.log('myarg')
    if (this.flags.myflag) this.log('myflag')
  }
}

test('runs the command', async () => {
  let cmd = await Command.run([], {mock: true})
  expect(cmd.stdout.output).toEqual('foo\n')
})

test('parses flags', async () => {
  let cmd = await Command.run(['--myarg'], {mock: true})
  expect(cmd.stdout.output).toEqual('foo\nmyarg\n')
})

test('parses args', async () => {
  let cmd = await Command.run(['myarg'], {mock: true})
  expect(cmd.stdout.output).toEqual('foo\nmyarg\n')
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
