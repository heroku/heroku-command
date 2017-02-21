// @flow

/* globals
  test
  expect
  */

import Base from '../command'
import {CustomColors} from '.'
import chalk from 'chalk'

chalk.enabled = true
CustomColors.supports = {has256: true}

class Command extends Base {}

test('shows red text', () => {
  const cmd = new Command()
  expect(cmd.color.red('red text')).toEqual('\u001b[31mred text\u001b[39m')
})

test('shows app', () => {
  const cmd = new Command()
  expect(cmd.color.app('myapp')).toEqual('\u001b[38;5;104m⬢ myapp\u001b[0m')
})

test('makes sure all custom options are accessible', () => {
  const cmd = new Command()
  chalk.enabled = true
  for (let k in CustomColors) {
    if (typeof cmd.color[k] === 'function') {
      cmd.color[k]('foo')
    }
  }
})
