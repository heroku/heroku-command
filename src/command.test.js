// @flow

// import Base from './command'
// import {BooleanFlag} from './flag'

// let run

// class Command extends Base {
//   static flags = {myflag: BooleanFlag()}
//   static args = [{name: 'myarg', required: false}]

//   async run (args) { run(args) }
// }

// beforeEach(() => { run = jest.fn() })

// test('runs the command', async () => {
//   await Command.mock()
//   expect(run).toBeCalledWith({
//     args: {},
//     argv: [],
//     flags: {}
//   })
// })

// test('parses args', async () => {
//   await Command.mock(['one'])
//   expect(run).toBeCalledWith({
//     args: {myarg: 'one'},
//     argv: ['one'],
//     flags: {}
//   })
// })

// test('handles error', async () => {
//   class Command extends Base {
//     run () { throw new Error('oops!') }
//   }
//   // flow$ignore
//   Command.prototype.error = jest.fn()
//   await Command.run([])
//   expect(Command.prototype.error.mock.calls[0][0]).toMatchObject({message: 'oops!'})
// })
