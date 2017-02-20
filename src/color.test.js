// @flow

/* globals
  test
  expect
  */

import Base from './base'
import color from './color'

class ColorTester extends color(Base) {}

test('shows if color is available', () => {
  const tester = new ColorTester({name: 'foo', version: '1.0'})
  expect(tester.color.app('myapp')).toEqual('\u001b[38;5;104m⬢ myapp\u001b[0m')
})
