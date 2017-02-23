// @flow
/* globals
   describe
   test
   expect
*/

import Config from './config'
import util from 'util'

describe('inspect', () => {
  test('prints the object', () => {
    let config = new Config({argv: ['heroku', 'apps']})
    expect(util.inspect(config)).toMatch(/^Config { /)
  })
})
