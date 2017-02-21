// @flow

/* globals
  test
  expect
  */

import Base from '../command'
import app from './app'

class Command extends app(Base) {}

test('has an app', async () => {
  const cmd = new Command(['heroku', 'foo', '--app', 'myapp'])
  await cmd.init()
  expect(cmd.app).toEqual('myapp')
})

test.skip('errors with no app', () => {
  const cmd = new Command()
  expect(cmd.app).toEqual('myapp')
})

test.skip('does not error when app is not specified', () => {
  class Command extends app(Command, {required: false}) {}
  const cmd = new Command()
  expect(cmd.app).toEqual('myapp')
})
