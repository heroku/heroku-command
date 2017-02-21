// @flow

/* globals
  test
  expect
  */

import Base from './command'

class Command extends Base {
  run () {
    this.log('foo')
  }
}

test('runs the command', () => {
  let cmd = new Command([], {mock: true})
  cmd.run()
  expect(cmd.stdout.output).toEqual('foo\n')
})
