// @flow

/* globals
  test
  expect
  */

import {Command} from '.'

class TestCommand extends Command {
  run () {
    this.log('foo')
  }
}

test('runs the command', () => {
  let cmd = new TestCommand({mock: true})
  cmd.run()
  expect(cmd.stdout).toEqual('foo')
})
