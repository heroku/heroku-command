// @flow

import nock from 'nock'
import Base from '../command'
import Heroku from './heroku'

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
  // TODO: set auth header in http-call
  // .matchHeader('user-agent', `cli-engine-command/${pjson.version} node-${process.version}`)
  .reply(200, [{name: 'myapp'}])

  const cmd = await Command.run([], {mock: true})
  let response = await cmd.heroku.get('/apps')
  expect(response).toEqual([{name: 'myapp'}])
})
