// @flow

/* globals
  test
  expect
  */

import Base from './base'
import color from './color'
import {DefaultConfig} from '../test/constants.js'
import chalk from 'chalk'

class ColorTester extends color(Base) {}

test('shows if color is available', () => {
  const tester = new ColorTester(DefaultConfig)
  chalk.enabled = true
  expect(tester.color.app('myapp')).toEqual('\u001b[38;5;104m⬢ myapp\u001b[0m')
})
