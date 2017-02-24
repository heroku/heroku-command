// @flow
/* globals
   describe
   test
   expect
*/

import Config from './config'
import format from 'pretty-format'
import os from 'os'
import path from 'path'

const config = new Config({argv: ['heroku', 'apps']})

describe('inspect', () => {
  test('prints the object', () => {
    expect(format(config)).toMatch(/^Object {/)
  })
})

test('props are set', () => {
  expect(config.name).toEqual('cli-engine-command')
  expect(config.version).toEqual('2.0.6')
  expect(config.channel).toEqual('stable')
  expect(config.argv).toEqual(['heroku', 'apps'])
  expect(config.mock).toEqual(false)
  expect(config.updateDisabled).toEqual(undefined)
  expect(config.bin).toEqual('cli-engine-command')
  expect(config.binPath).toEqual(undefined)
  expect(config.root).toEqual(path.join(__dirname, '..'))
  expect(config.defaultCommand).toEqual('help')
  expect(config.s3).toEqual({})
  expect(config._cli).toEqual({})
  expect(config.windows).toEqual(os.platform === 'win32')
})
