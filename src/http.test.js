// @flow

/* globals
  test
  beforeEach
  expect
  afterEach
  */

import Command from './command'
import http from './http'
import * as mixins from './mixins'
import nock from 'nock'

class HttpTester extends mixins.mix(Command).with(http()) {}

let api
beforeEach(() => {
  api = nock('https://api.heroku.com')
})
afterEach(() => {
  api.done()
})

test('runs the command', async () => {
  api.get('/')
  .reply(200, {message: 'ok'})

  const tester = new HttpTester()
  let response = await tester.http.get('https://api.heroku.com')
  expect(response).toEqual({message: 'ok'})
})
