// @flow

/* globals
  test
  expect
  */

import Base, {CustomColors} from '.'
import chalk from 'chalk'

chalk.enabled = true
CustomColors.supports = {has256: true}

class Output extends Base {}

test('shows red text', () => {
  const cmd = new Output({mock: true})
  expect(cmd.color.red('red text')).toEqual('\u001b[31mred text\u001b[39m')
})

test('shows app', () => {
  const cmd = new Output({mock: true})
  expect(cmd.color.app('myapp')).toEqual('\u001b[38;5;104m⬢ myapp\u001b[0m')
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
