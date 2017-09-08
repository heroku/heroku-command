// @flow

import Base, {CustomColors} from '.'
import chalk from 'chalk'
import stdmock from 'std-mocks'
import fs from 'fs-extra'

jest.mock('fs-extra')

class Output extends Base {}

let env = process.env
beforeEach(() => {
  chalk.enabled = false
  CustomColors.supports = false
  process.env = {}
})

afterEach(() => {
  process.env = env
})

test('outputs to stdout', () => {
  stdmock.use()
  const out = new Output({mock: false})
  out.stdout.write('it works')
  out.stdout.log('it works')
  stdmock.restore()
  expect(stdmock.flush().stdout).toEqual(['it works', 'it works\n'])
})

test('outputs to stderr', () => {
  stdmock.use()
  const out = new Output({mock: false})
  out.stderr.write('it works')
  stdmock.restore()
  expect(stdmock.flush().stderr).toEqual(['it works'])
})

describe('with color', () => {
  test('shows red text', () => {
    const cmd = new Output({mock: true})
    chalk.enabled = true
    CustomColors.supports = {has256: true}
    expect(cmd.color.red('red text')).toEqual('\u001b[31mred text\u001b[39m')
  })

  test('shows app', () => {
    const cmd = new Output({mock: true})
    chalk.enabled = true
    CustomColors.supports = {has256: true}
    expect(cmd.color.app('myapp')).toEqual('\u001b[38;5;104m⬢ myapp\u001b[0m')
  })

  test('styledJSON', () => {
    const out = new Output({mock: true})
    chalk.enabled = true
    CustomColors.supports = {has256: true}
    out.styledJSON({foo: 'bar'})
    expect(out.stdout.output).toBe(`\u001b[97m{\u001b[39m\n  \u001b[94m"foo"\u001b[39m\u001b[93m:\u001b[39m \u001b[92m"bar"\u001b[39m\n\u001b[97m}\u001b[39m\n`)
  })
})

test('makes sure all custom options are accessible', () => {
  const cmd = new Output({mock: true})
  chalk.enabled = true
  for (let k in CustomColors) {
    if (typeof cmd.color[k] === 'function') {
      cmd.color[k]('foo')
    }
  }
})

test('exit', () => {
  expect.assertions(1)
  const out = new Output({mock: true})
  try {
    out.exit(1)
  } catch (err) {
    expect(err.code).toBe(1)
  }
})

test('warn', () => {
  const out = new Output({mock: true})
  out.warn('foo')
  expect(out.stderr.output).toContain('foo')
})

describe('error', () => {
  test('raises when mocking', () => {
    expect.assertions(1)
    const out = new Output({mock: true})
    let foo = new Error('foo')
    try {
      out.error(foo)
    } catch (err) {
      expect(err).toEqual(foo)
    }
  })

  test('error', () => {
    expect.assertions(2)
    const out = new Output({mock: true})
    try {
      out.error('foo\nbar')
    } catch (err) {
      expect(err.code).toBe(1)
      expect(out.stderr.output).toContain('foo')
    }
  })

  test('logs error', () => {
    const out = new Output({mock: true})
    let err = new Error('foo')
    out.error(err, false)
    expect(fs.appendFileSync.mock.calls[0][0]).toEqual(out.errlog)
    expect(fs.appendFileSync.mock.calls[0][1]).toMatch(/^Error: foo/)
    expect(fs.appendFileSync.mock.calls[0][1].endsWith('\n')).toBeTruthy()
  })
})

test('styledHeader', () => {
  const out = new Output({mock: true})
  out.styledHeader('foobar')
  expect(out.stdout.output).toBe('=== foobar\n')
})

test('styledJSON', () => {
  const out = new Output({mock: true})
  out.styledJSON({foo: 'bar'})
  expect(out.stdout.output).toBe(`{
  "foo": "bar"
}
`)
})

test('styledObject', () => {
  const out = new Output({mock: true})
  out.styledObject({foo: 'bar', info: {arr: ['a', 'b', 'c']}}, ['foo', 'info'])
  expect(out.stdout.output).toBe(`foo:  bar
info: arr: [ 'a', 'b', 'c' ]
`)
})

describe('inspect', () => {
  let dir

  beforeEach(() => {
    dir = console.dir
    ;(console: any).dir = jest.fn()
  })

  afterEach(() => {
    (console: any).dir = dir
  })

  test('inspects', () => {
    const out = new Output()
    out.inspect({foo: 'bar'})
    expect(console.dir).toBeCalledWith({foo: 'bar'}, {colors: true})
  })
})

test('table', () => {
  const out = new Output({mock: true})
  out.table([{name: 'a'}, {name: 'b'}], {
    columns: [{key: 'name'}]
  })
  expect(out.stdout.output).toBe(`name
────
a
b
`)
})
