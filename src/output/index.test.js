// @flow

/* globals
  test
  expect
  describe
  beforeEach
  */

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
  stdmock.restore()
  expect(stdmock.flush().stdout).toEqual(['it works'])
})

test('outputs to stderr', () => {
  stdmock.use()
  const out = new Output({mock: false})
  out.stderr.write('it works')
  stdmock.restore()
  expect(stdmock.flush().stderr).toEqual(['it works'])
})

describe('with color', () => {
  beforeEach(() => {
    chalk.enabled = true
    CustomColors.supports = {has256: true}
  })

  test('shows red text', () => {
    const cmd = new Output({mock: true})
    expect(cmd.color.red('red text')).toEqual('\u001b[31mred text\u001b[39m')
  })

  test('shows app', () => {
    const cmd = new Output({mock: true})
    expect(cmd.color.app('myapp')).toEqual('\u001b[38;5;104m⬢ myapp\u001b[0m')
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
    out.error('foo')
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
