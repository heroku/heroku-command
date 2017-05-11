// @flow

import Help from './help'
import Command from './command'
import {buildConfig} from 'cli-engine-config'
import boolean from './flags/boolean'
import string from './flags/string'

class AppsCreate extends Command {
  static topic = 'apps'
  static command = 'create'
  static description = 'description of apps:create'

  static args = [{name: 'app_name', required: false}]

  static help = `some

multiline help
`

  static flags = {
    force: boolean({description: 'force it'}),
    app: string({char: 'a', hidden: true}),
    foo: string({char: 'f', description: 'foobar'}),
    remote: string({char: 'r'})
  }
}

const help = new Help(buildConfig())

describe('commandLine()', () => {
  test('has help', () => {
    expect(help.command(AppsCreate)).toEqual(`Usage: cli-engine apps:create [APP_NAME]
description of apps:create
 -f, --foo    # foobar
 -r, --remote
 --force      # force it
some

multiline help\n`)
  })
})

describe('command()', () => {
  test('has help', () => {
    expect(help.commandLine(AppsCreate)).toEqual(['apps:create [APP_NAME]', 'description of apps:create'])
  })
})
