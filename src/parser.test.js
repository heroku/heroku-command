// // @flow

import Parser from './parser'
import {BooleanFlag, StringFlag} from './flag'

test('parses args and flags', async () => {
  const p = new Parser({
    args: [{name: 'myarg'}, {name: 'myarg2'}],
    flags: {myflag: StringFlag()}
  })
  const {argv, flags} = await p.parse({argv: ['foo', '--myflag', 'bar', 'baz']})
  expect(argv[0]).toEqual('foo')
  expect(argv[1]).toEqual('baz')
  expect(flags.myflag).toEqual('bar')
})

describe('flags', () => {
  test('parses flags', async () => {
    const p = new Parser({flags: {myflag: BooleanFlag(), myflag2: BooleanFlag()}})
    const {flags} = await p.parse({argv: ['--myflag', '--myflag2']})
    expect(flags.myflag).toBeTruthy()
    expect(flags.myflag2).toBeTruthy()
  })

  test('parses short flags', async () => {
    const p = new Parser({
      flags: {
        myflag: BooleanFlag({char: 'm'}),
        force: BooleanFlag({char: 'f'})
      }
    })
    const {flags} = await p.parse({argv: ['-mf']})
    expect(flags.myflag).toBeTruthy()
    expect(flags.force).toBeTruthy()
  })

  test('parses flag value with "=" to separate', async () => {
    const p = new Parser({
      flags: {
        myflag: StringFlag({char: 'm'})
      }
    })
    const {flags} = await p.parse({argv: ['--myflag=foo']})
    expect(flags).toEqual({myflag: 'foo'})
  })

  test('parses flag value with "=" in value', async () => {
    const p = new Parser({
      flags: {
        myflag: StringFlag({char: 'm'})
      }
    })
    const {flags} = await p.parse({argv: ['--myflag', '=foo']})
    expect(flags).toEqual({myflag: '=foo'})
  })

  test('parses short flag value with "="', async () => {
    const p = new Parser({
      flags: {
        myflag: StringFlag({char: 'm'})
      }
    })
    const {flags} = await p.parse({argv: ['-m=foo']})
    expect(flags).toEqual({myflag: 'foo'})
  })

  test('requires required flag', async () => {
    const p = new Parser({
      flags: {
        myflag: StringFlag({required: true})
      }
    })
    expect.assertions(1)
    try {
      await p.parse()
    } catch (err) {
      expect(err.message).toEqual('Missing required flag --myflag')
    }
  })

  test('requires nonoptional flag', async () => {
    const p = new Parser({
      flags: {
        myflag: StringFlag({optional: false})
      }
    })
    expect.assertions(1)
    try {
      await p.parse()
    } catch (err) {
      expect(err.message).toEqual('Missing required flag --myflag')
    }
  })

  test('removes flags from argv', async () => {
    const p = new Parser({
      args: [{name: 'myarg'}],
      flags: {myflag: StringFlag()}
    })
    const {flags, argv} = await p.parse({argv: ['--myflag', 'bar', 'foo']})
    expect(flags).toEqual({myflag: 'bar'})
    expect(argv).toEqual(['foo'])
  })
})

describe('args', () => {
  test('requires args by default', async () => {
    const p = new Parser({args: [{name: 'myarg'}, {name: 'myarg2'}]})
    try {
      await p.parse()
    } catch (err) {
      expect(err.message).toEqual('Missing required argument myarg')
    }
  })

  test('parses args', async () => {
    const p = new Parser({args: [{name: 'myarg'}, {name: 'myarg2'}]})
    const {argv} = await p.parse({argv: ['foo', 'bar']})
    expect(argv).toEqual(['foo', 'bar'])
  })

  test('skips optional args', async () => {
    const p = new Parser({args: [{name: 'myarg', optional: true}, {name: 'myarg2', optional: true}]})
    const {argv} = await p.parse({argv: ['foo']})
    expect(argv).toEqual(['foo'])
  })

  test('skips non-required args', async () => {
    const p = new Parser({args: [{name: 'myarg', required: false}, {name: 'myarg2', required: false}]})
    const {argv} = await p.parse({argv: ['foo']})
    expect(argv).toEqual(['foo'])
  })

  test('parses something looking like a flag as an arg', async () => {
    const p = new Parser({args: [{name: 'myarg'}]})
    const {argv} = await p.parse({argv: ['--foo']})
    expect(argv).toEqual(['--foo'])
  })
})

describe('variableArgs', () => {
  test('skips flag parsing after "--"', async () => {
    const p = new Parser({
      variableArgs: true,
      flags: {myflag: BooleanFlag()},
      args: [{name: 'argOne'}]
    })
    const {argv} = await p.parse({argv: ['foo', 'bar', '--', '--myflag']})
    expect(argv).toEqual(['foo', 'bar', '--myflag'])
  })
})
