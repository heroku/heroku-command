// @flow

import Base from '../command'
import OrgFlag from './org'
import {Flag} from '../flag'

type Flags = {
  org: OrgFlag,
  two: Flag
}

class Command extends Base <{flags: Flags}> {
  static flags = {org: OrgFlag, two: Flag}
  org: ?string
  // async run ({flags}: {
  //   flags: {org: OrgFlag}
  // }) {
  async run ({flags}) {
    // this.org = flags.org.name
  }
}

test.only('has an org', async () => {
  const cmd = await Command.mock(['--org', 'myorg'])
  expect(cmd.org).toEqual('myorg')
})

// test('errors with no org', async () => {
//   class Command extends Base {
//     static flags = {org: OrgFlag.with({required: true})}
//   }
//   expect.assertions(1)
//   try {
//     let cmd = await Command.run([], {mock: true})
//     console.log(cmd.flags.org.value) // should not get here
//   } catch (err) {
//     expect(err.message).toContain('No org specified')
//   }
// })

// test('does not error when org is not specified', async () => {
//   const cmd = await Command.run()
//   expect(cmd.flags.org.value).toBeUndefined()
// })
