// @flow
/* globals
   describe
   test
   expect
*/

import Config from './config'
import format from 'pretty-format'

describe('inspect', () => {
  test('prints the object', () => {
    let config = new Config({argv: ['heroku', 'apps']})
    expect(format(config)).toMatch(/^Object {/)
  })
})
