// @flow

/* globals
  test
  expect
  */

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
  let cmd = new Command({mock: true})
  await cmd._run()
  expect(cmd.stdout.output).toEqual('foo\n')
})

test('parses flags', async () => {
  let cmd = new Command({mock: true, argv: ['heroku', 'cmd', '--myarg']})
  await cmd._run()
  expect(cmd.stdout.output).toEqual('foo\nmyarg\n')
})

test('parses args', async () => {
  let cmd = new Command({mock: true, argv: ['heroku', 'cmd', 'myarg']})
  await cmd._run()
  expect(cmd.stdout.output).toEqual('foo\nmyarg\n')
})
