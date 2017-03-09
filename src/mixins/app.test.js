// @flow

import Base from '../command'
import app from './app'

class Command extends app(Base) {}

test('has an app', async () => {
  const cmd = await Command.run(['--app', 'myapp'])
  expect(cmd.app).toEqual('myapp')
})

test('errors with no app', async () => {
  expect.assertions(1)
  try {
    await Command.run()
  } catch (err) {
    expect(err.message).toContain('No app specified')
  }
})

test('does not error when app is not specified', async () => {
  class Command extends app(Base, {required: false}) {}
  const cmd = await Command.run()
  expect(cmd.app).toBeUndefined()
})
