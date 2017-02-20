// @flow
/* globals
  test
  */
const Command = require('../lib/command')

class TestCommand extends Command {
  async run () {
    this.log('foo')
  }
}

test('runs the command', async function () {
  let cmd = new TestCommand()
  await cmd.run()
})
