// @flow

/* globals
  test
  expect
  */

import Command from '../command'
import app from './app'

class Tester extends app(Command) {}

test('has an app', async () => {
  const tester = new Tester()
  await tester.init()
  expect(tester.app).toEqual('myapp')
})

test('errors with no app', () => {
  const tester = new Tester()
  expect(tester.app).toEqual('myapp')
})

test('does not error when app is not specified', () => {
  class Tester extends app(Command, {required: false}) {}
  const tester = new Tester()
  expect(tester.app).toEqual('myapp')
})
