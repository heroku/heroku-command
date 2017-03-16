// @flow

import HTTP from './http'
import Output from './output'
import nock from 'nock'
import Config from './config'
import pjson from '../package.json'

let api
beforeEach(() => {
  api = nock('https://api.heroku.com')
})
afterEach(() => {
  api.done()
})

test('makes an HTTP request', async () => {
  api.get('/')
  .matchHeader('user-agent', `cli-engine-command/${pjson.version} node-${process.version}`)
  .reply(200, {message: 'ok'})

  const out = new Output(new Config({mock: true, debug: 2}))
  const http = new HTTP(out)
  let response = await http.get('https://api.heroku.com')
  expect(response).toEqual({message: 'ok'})
  expect(out.stderr.output).toContain('--> GET https://api.heroku.com')
  expect(out.stderr.output).toContain('<-- GET https://api.heroku.com')
  expect(out.stderr.output).toContain('{ message: \'ok\' }')
})

test('stream', async () => {
  api.get('/')
  .matchHeader('user-agent', `cli-engine-command/${pjson.version} node-${process.version}`)
  .reply(200, {message: 'ok'})

  const out = new Output(new Config({mock: true}))
  const http = new HTTP(out)
  const response = await http.stream('https://api.heroku.com')
  const body = JSON.parse(await concat(response))
  expect(body).toEqual({message: 'ok'})
})

function concat (stream) {
  return new Promise(resolve => {
    let strings = []
    stream.on('data', data => strings.push(data))
    stream.on('end', () => resolve(strings.join('')))
  })
}
