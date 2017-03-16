// @flow

import nock from 'nock'
import Base from '../command'
import Heroku from './heroku'
import Netrc from 'netrc-parser'

jest.mock('netrc-parser')

// flow$ignore
Netrc.mockImplementation(() => {
  return {machines: {'api.heroku.com': {password: 'mypass'}}}
})

class Command extends Base {
  heroku = new Heroku(this, {required: false})
}

let api
beforeEach(() => {
  api = nock('https://api.heroku.com')
})
afterEach(() => {
  api.done()
})

test('makes an HTTP request', async () => {
  api.get('/apps')
  .matchHeader('authorization', ':mypass')
  .reply(200, [{name: 'myapp'}])

  const cmd = await Command.run([], {mock: true})
  let response = await cmd.heroku.get('/apps')
  expect(response).toEqual([{name: 'myapp'}])
})
