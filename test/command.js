const {describe, it} = require('mocha')
const Command = require('../lib/command')

class TestCommand extends Command {
  async run () {
    this.log('foo')
  }
}

describe('Command', () => {
  it('runs the command', async function () {
    let cmd = new TestCommand()
    await cmd.run()
  })
})
