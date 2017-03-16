// @flow

import Base from '../command'
import App, {AppFlag, RemoteFlag} from './app'
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
  static flags = [AppFlag, RemoteFlag]
  app = new App(this)
}

beforeEach(() => {
  gitRemotes = []
})

test('has an app', async () => {
  const cmd = await Command.run(['--app', 'myapp'], {mock: true})
  expect(cmd.app.name).toEqual('myapp')
})

test('gets app from --remote flag', async () => {
  gitRemotes = [
    {name: 'staging', url: 'https://git.heroku.com/myapp-staging.git'},
    {name: 'production', url: 'https://git.heroku.com/myapp-production.git'}
  ]
  const cmd = await Command.run(['-r', 'staging'], {mock: true})
  expect(cmd.app.name).toEqual('myapp-staging')
})

test('errors if --remote not found', async () => {
  expect.assertions(1)
  gitRemotes = [
    {name: 'staging', url: 'https://git.heroku.com/myapp-staging.git'},
    {name: 'production', url: 'https://git.heroku.com/myapp-production.git'}
  ]
  try {
    let cmd = await Command.run(['-r', 'foo'], {mock: true})
    cmd.log(cmd.app.name)
  } catch (err) {
    expect(err.message).toEqual('remote foo not found in git remotes')
  }
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

test('errors with 2 git remotes', async () => {
  expect.assertions(1)
  gitRemotes = [
    {name: 'staging', url: 'https://git.heroku.com/myapp-staging.git'},
    {name: 'production', url: 'https://git.heroku.com/myapp-production.git'}
  ]
  try {
    let cmd = await Command.run([], {mock: true})
    console.log(cmd.app.name) // should not get here
  } catch (err) {
    expect(err.message).toContain('Multiple apps in git remotes')
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
