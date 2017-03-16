// @flow

import Base from '../command'
import App, {AppFlag} from './app'
import Git, {type Remote} from '../git'

jest.mock('../git')

let gitRemotes: Remote[]
// flow$ignore
Git.mockImplementation(() => {
  return {
    remotes: gitRemotes
  }
})

class Command extends Base {
  static flags = [AppFlag]
  app = new App(this)
}

beforeEach(() => {
  gitRemotes = []
})

test('has an app', async () => {
  const cmd = await Command.run(['--app', 'myapp'], {mock: true})
  expect(cmd.app.name).toEqual('myapp')
})

test('errors with no app', async () => {
  class Command extends Base {
    static flags = [AppFlag]
    app = new App(this, {required: true})
  }
  expect.assertions(1)
  try {
    let cmd = await Command.run([], {mock: true})
    console.log(cmd.app.name) // should not get here
  } catch (err) {
    expect(err.message).toContain('No app specified')
  }
})

test('gets app from git config', async () => {
  gitRemotes = [{name: 'heroku', url: 'https://git.heroku.com/myapp.git'}]
  const cmd = await Command.run()
  expect(cmd.app.name).toEqual('myapp')
})

test('does not error when app is not specified', async () => {
  const cmd = await Command.run()
  expect(cmd.app.name).toBeUndefined()
})
