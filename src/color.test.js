// @flow

/* globals
  test
  */

import Base from './base'
import color from './color'

class ColorTester extends color(Base) {}

test('shows if color is available', () => {
  const tester = new ColorTester({name: 'foo', version: '1.0'})
  console.log(tester.color.ap('f'))
  // console.dir(tester.color)
})
