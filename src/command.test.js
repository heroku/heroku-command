// @flow

/* globals
  test
  expect
  */

import Base from './command'

class Command extends Base {
  run () {
    this.log('foo')
    if (this.flags.debug) this.log('debug')
  }
}

test('runs the command', async () => {
  let cmd = new Command({mock: true})
  await cmd._run()
  expect(cmd.stdout.output).toEqual('foo\n')
})

test('parses args', async () => {
  let cmd = new Command({mock: true, argv: ['heroku', 'cmd', '--debug']})
  await cmd._run()
  expect(cmd.flags.debug).toBeTruthy()
  expect(cmd.stdout.output).toEqual('foo\ndebug\n')
})
