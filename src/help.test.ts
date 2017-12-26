import { buildConfig } from 'cli-engine-config'
import { flags } from 'cli-flags'
import { Command as Base } from './command'
import deps from './deps'
import { Help } from './help'

class Command extends Base {
  async run() {
    return
  }
}

deps.cli!.config.mock = true

class AppsCreate extends Command {
  static id = 'apps:create'
  static description = 'description of apps:create'
  static help = `some

multiline help
`
  static args = [{ name: 'app_name', description: 'app to use' }]
  static flags = {
    app: flags.string({ char: 'a', hidden: true }),
    foo: flags.string({ char: 'f', description: 'foobar' }),
    force: flags.boolean({ description: 'force it' }),
    remote: flags.string({ char: 'r' }),
  }
}

const help = new Help(buildConfig())

describe('commandLine()', () => {
  test('has help', () => {
    expect(help.command(AppsCreate)).toEqual(`Usage: cli-engine apps:create [APP_NAME] [flags]

description of apps:create

APP_NAME  app to use

Flags:
 -f, --foo FOO        foobar
 -r, --remote REMOTE
 --force              force it

some

multiline help
`)
  })

  class AppsCreate3 extends Command {
    static id = 'apps:create'
    static flags = {
      app: flags.string({ char: 'a', hidden: true }),
      foo: flags.string({ char: 'f', description: 'foobar' }),
      force: flags.boolean({ description: 'force it' }),
      remote: flags.string({ char: 'r' }),
    }
  }
  test('has just flags', () => {
    expect(help.command(AppsCreate3)).toEqual(`Usage: cli-engine apps:create [flags]

Flags:
 -f, --foo FOO        foobar
 -r, --remote REMOTE
 --force              force it
`)
  })

  test('has flags + description', () => {
    class CMD extends Command {
      static id = 'apps:create'
      static description = 'description of apps:create'
      static flags = {
        app: flags.string({ char: 'a', hidden: true }),
        foo: flags.string({ char: 'f', description: 'foobar' }),
        force: flags.boolean({ description: 'force it' }),
        remote: flags.string({ char: 'r' }),
      }
    }
    expect(help.command(CMD)).toEqual(`Usage: cli-engine apps:create [flags]

description of apps:create

Flags:
 -f, --foo FOO        foobar
 -r, --remote REMOTE
 --force              force it
`)
  })

  class AppsCreate1 extends Command {
    static id = 'apps:create'
    static help = 'description of apps:create'
    static flags = {
      app: flags.string({ char: 'a', hidden: true }),
      foo: flags.string({ char: 'f', description: 'foobar' }),
      force: flags.boolean({ description: 'force it' }),
      remote: flags.string({ char: 'r' }),
    }
  }
  test('has description + help', () => {
    expect(help.command(AppsCreate1)).toEqual(`Usage: cli-engine apps:create [flags]

Flags:
 -f, --foo FOO        foobar
 -r, --remote REMOTE
 --force              force it

description of apps:create
`)
  })

  class AppsCreate2 extends Command {
    static id = 'apps:create'
    static description = 'description of apps:create'
    static args = [{ name: 'app_name', description: 'app to use' }]
  }

  test('has description + args', () => {
    expect(help.command(AppsCreate2)).toEqual(`Usage: cli-engine apps:create [APP_NAME]

description of apps:create

APP_NAME  app to use
`)
  })

  class CMD extends Command {
    static id = 'apps:create2'
    static description = 'description of apps:create2'
    static args = [{ name: 'app_name', description: 'app to use' }]
    static aliases = ['foo', 'bar']
  }
  test('has aliases', () => {
    expect(help.command(CMD)).toEqual(`Usage: cli-engine apps:create2 [APP_NAME]

description of apps:create2

Aliases:
  $ cli-engine foo
  $ cli-engine bar

APP_NAME  app to use
`)
  })
})

describe('command()', () => {
  test('has command help', () => {
    expect(help.commandLine(AppsCreate)).toEqual(['apps:create [APP_NAME]', 'description of apps:create'])
  })
})
