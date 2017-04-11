// @flow

import Base, {CustomColors} from '.'
import chalk from 'chalk'
import stdmock from 'std-mocks'

class Output extends Base {}

beforeEach(() => {
  chalk.enabled = false
  CustomColors.supports = false
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

test('inspect', () => {
  const out = new Output()
  stdmock.use()
  out.inspect({foo: 'bar', info: {arr: ['a', 'b', 'c']}}, ['foo', 'info'])
  stdmock.restore()
  expect(stdmock.flush().stderr[0]).toEqual(`Object {
  "foo": "bar",
  "info": Object {
    "arr": Array [
      "a",
      "b",
      "c",
    ],
  },
}
`)
})
