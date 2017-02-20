// @flow

/* globals
  test
  expect
  */

import Base from './base'
import color, {CustomColors} from './color'
import {DefaultConfig} from '../test/constants.js'
import chalk from 'chalk'

class ColorTester extends color(Base) {}

test('shows red text', () => {
  const tester = new ColorTester(DefaultConfig)
  chalk.enabled = true
  expect(tester.color.red('red text')).toEqual('\u001b[31mred text\u001b[39m')
})

test('shows app', () => {
  const tester = new ColorTester(DefaultConfig)
  chalk.enabled = true
  expect(tester.color.app('myapp')).toEqual('\u001b[38;5;104m⬢ myapp\u001b[0m')
})

test('makes sure all custom options are accessible', () => {
  const tester = new ColorTester(DefaultConfig)
  chalk.enabled = true
  for (let k in CustomColors) {
    if (typeof tester.color[k] === 'function') {
      tester.color[k]('foo')
    }
  }
})
