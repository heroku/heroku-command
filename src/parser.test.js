// @flow

import Parser from './parser'

test('parses args and flags', async () => {
  const p = new Parser({
    args: [{name: 'myarg'}],
    flags: [{name: 'myflag', hasValue: true}]
  })
  const {args, flags} = await p.parse('foo', '--myflag', 'bar')
  expect(args.myarg).toEqual('foo')
  expect(flags.myflag).toEqual('bar')
})

describe('flags', () => {
  test('parses flags', async () => {
    const p = new Parser({flags: [{name: 'myflag'}, {name: 'myflag2'}]})
    const {flags} = await p.parse('--myflag', '--myflag2')
    expect(flags.myflag).toBeTruthy()
    expect(flags.myflag2).toBeTruthy()
  })

  test('parses short flags', async () => {
    const p = new Parser({flags: [{name: 'myarg', char: 'm'}, {name: 'force', char: 'f'}]})
    const {flags} = await p.parse('-mf')
    expect(flags.myarg).toBeTruthy()
    expect(flags.force).toBeTruthy()
  })

  test('parses flag value with "=" to separate', async () => {
    const p = new Parser({flags: [{name: 'myflag', char: 'm', hasValue: true}]})
    const {flags} = await p.parse('--myflag=foo')
    expect(flags).toEqual({myflag: 'foo'})
  })

  test('parses flag value with "=" in value', async () => {
    const p = new Parser({flags: [{name: 'myflag', char: 'm', hasValue: true}]})
    const {flags} = await p.parse('--myflag', '=foo')
    expect(flags).toEqual({myflag: '=foo'})
  })

  test('parses short flag value with "="', async () => {
    const p = new Parser({flags: [{name: 'myflag', char: 'm', hasValue: true}]})
    const {flags} = await p.parse('-m=foo')
    expect(flags).toEqual({myflag: 'foo'})
  })

  test('requires required flag', async () => {
    expect.assertions(1)
    const p = new Parser({flags: [{name: 'myarg', required: true}]})
    try {
      await p.parse()
    } catch (err) {
      expect(err.message).toEqual('Missing required flag --myarg')
    }
  })

  test('removes flags from argv', async () => {
    const p = new Parser({
      args: [{name: 'myarg'}],
      flags: [{name: 'myflag', hasValue: true}]
    })
    const {args, flags, argv} = await p.parse('--myflag', 'bar', 'foo')
    expect(args).toEqual({myarg: 'foo'})
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
    const {args} = await p.parse('foo', 'bar')
    expect(args.myarg).toEqual('foo')
    expect(args.myarg2).toEqual('bar')
  })

  test('skips optional args', async () => {
    const p = new Parser({args: [{name: 'myarg', optional: true}, {name: 'myarg2', optional: true}]})
    const {args} = await p.parse('foo')
    expect(args.myarg).toEqual('foo')
    expect(args.myarg2).toBeUndefined()
  })

  test('skips non-required args', async () => {
    const p = new Parser({args: [{name: 'myarg', required: false}, {name: 'myarg2', required: false}]})
    const {args} = await p.parse('foo')
    expect(args.myarg).toEqual('foo')
    expect(args.myarg2).toBeUndefined()
  })

  test('parses something looking like a flag as an arg', async () => {
    const p = new Parser({args: [{name: 'myarg'}]})
    const {args} = await p.parse('--foo')
    expect(args.myarg).toEqual('--foo')
  })
})

describe('variableArgs', () => {
  test('skips flag parsing after "--"', async () => {
    const p = new Parser({
      variableArgs: true,
      flags: [{name: 'myflag'}],
      args: [{name: 'argOne'}]
    })
    const {argv, args} = await p.parse('foo', 'bar', '--', '--myflag')
    expect(args).toEqual({argOne: 'foo'})
    expect(argv).toEqual(['foo', 'bar', '--myflag'])
  })
})
