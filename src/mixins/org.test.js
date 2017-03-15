// @flow

import Base from '../command'
import Org, {OrgFlag} from './org'

class Command extends Base {
  static flags = [OrgFlag]
  org = new Org(this)
}

test('has an org', async () => {
  const cmd = await Command.run(['--org', 'myorg'], {mock: true})
  expect(cmd.org.name).toEqual('myorg')
})

test('errors with no org', async () => {
  class Command extends Base {
    static flags = [OrgFlag]
    org = new Org(this, {required: true})
  }
  expect.assertions(1)
  try {
    let cmd = await Command.run([], {mock: true})
    console.log(cmd.org.name) // should not get here
  } catch (err) {
    expect(err.message).toContain('No org specified')
  }
})

test('does not error when org is not specified', async () => {
  const cmd = await Command.run()
  expect(cmd.org.name).toBeUndefined()
})
