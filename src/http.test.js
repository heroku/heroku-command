// @flow

/* globals
  test
  beforeEach
  expect
  afterEach
  */

import Base from './base'
import http from './http'
import nock from 'nock'

// class HttpTester extends http()(Base) {}
class HttpTester extends http(Base) {}

let api
beforeEach(() => {
  api = nock('https://api.heroku.com')
})
afterEach(() => {
  api.done()
})

test('makes an HTTP request', async () => {
  api.get('/')
  .matchHeader('user-agent', `foo/1.0 node-${process.version}`)
  .reply(200, {message: 'ok'})

  const tester = new HttpTester({name: 'foo', version: '1.0'})
  let response = await tester.http.get('https://api.heroku.com')
  expect(response).toEqual({message: 'ok'})
})
