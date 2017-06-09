// @flow

import Help from './help'
import Command from './command'
import {buildConfig} from 'cli-engine-config'
import boolean from './flags/boolean'
import string from './flags/string'
import Output from './output'

class AppsCreate extends Command {
  static topic = 'apps'
  static command = 'create'
  static description = 'description of apps:create'

  static args = [{name: 'app_name', description: 'app to use', required: false}]

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

const output = new Output({mock: true})
const help = new Help(buildConfig(), output)

describe('commandLine()', () => {
  test('has help', () => {
    expect(help.command(AppsCreate)).toEqual(`
Usage: cli-engine apps:create [APP_NAME] [flags]

description of apps:create

APP_NAME  app to use

Flags:
 -f, --foo     foobar
 -r, --remote
 --force       force it

some

multiline help
`)
  })

  test('has just flags', () => {
    expect(help.command(class extends Command {
      static topic = 'apps'
      static command = 'create'
      static flags = {
        force: boolean({description: 'force it'}),
        app: string({char: 'a', hidden: true}),
        foo: string({char: 'f', description: 'foobar'}),
        remote: string({char: 'r'})
      }
    })).toEqual(`
Usage: cli-engine apps:create [flags]

Flags:
 -f, --foo     foobar
 -r, --remote
 --force       force it
`)
  })

  test('has flags + description', () => {
    expect(help.command(class extends Command {
      static topic = 'apps'
      static command = 'create'
      static description = 'description of apps:create'
      static flags = {
        force: boolean({description: 'force it'}),
        app: string({char: 'a', hidden: true}),
        foo: string({char: 'f', description: 'foobar'}),
        remote: string({char: 'r'})
      }
    })).toEqual(`
Usage: cli-engine apps:create [flags]

description of apps:create

Flags:
 -f, --foo     foobar
 -r, --remote
 --force       force it
`)
  })

  test('has description + help', () => {
    expect(help.command(class extends Command {
      static topic = 'apps'
      static command = 'create'
      static help = 'description of apps:create'
      static flags = {
        force: boolean({description: 'force it'}),
        app: string({char: 'a', hidden: true}),
        foo: string({char: 'f', description: 'foobar'}),
        remote: string({char: 'r'})
      }
    })).toEqual(`
Usage: cli-engine apps:create [flags]

Flags:
 -f, --foo     foobar
 -r, --remote
 --force       force it

description of apps:create
`)
  })

  test('has description + args', () => {
    expect(help.command(class extends Command {
      static topic = 'apps'
      static command = 'create'
      static description = 'description of apps:create'
      static args = [{name: 'app_name', description: 'app to use', required: false}]
    })).toEqual(`
Usage: cli-engine apps:create [APP_NAME]

description of apps:create

APP_NAME  app to use
`)
  })
})

describe('command()', () => {
  test('has help', () => {
    expect(help.commandLine(AppsCreate)).toEqual(['apps:create [APP_NAME]', 'description of apps:create'])
  })
})
