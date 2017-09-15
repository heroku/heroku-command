import { Help } from './help'
import { Command as Base } from './command'
import { buildConfig } from 'cli-engine-config'
import { flags } from 'cli-flags'

class Command extends Base {
  async run() {
    return
  }
}

class AppsCreate extends Command {
  __config = {
    _version: '',
    id: 'apps:create',
  }
  options = {
    description: 'description of apps:create',
    help: `some

multiline help
`,
    args: [{ name: 'app_name', description: 'app to use' }],
    flags: {
      force: flags.boolean({ description: 'force it' }),
      app: flags.string({ char: 'a', hidden: true }),
      foo: flags.string({ char: 'f', description: 'foobar' }),
      remote: flags.string({ char: 'r' }),
    },
  }
}

const help = new Help(buildConfig({ mock: true }))

describe('commandLine()', () => {
  test('has help', () => {
    expect(help.command(new AppsCreate())).toEqual(`Usage: cli-engine apps:create [APP_NAME] [flags]

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
    __config = {
      _version: '',
      id: 'apps:create',
    }
    options = {
      flags: {
        force: flags.boolean({ description: 'force it' }),
        app: flags.string({ char: 'a', hidden: true }),
        foo: flags.string({ char: 'f', description: 'foobar' }),
        remote: flags.string({ char: 'r' }),
      },
    }
  }
  test('has just flags', () => {
    expect(help.command(new AppsCreate3())).toEqual(`Usage: cli-engine apps:create [flags]

Flags:
 -f, --foo FOO        foobar
 -r, --remote REMOTE
 --force              force it
`)
  })

  test('has flags + description', () => {
    class CMD extends Command {
      __config = {
        _version: '',
        id: 'apps:create',
      }
      options = {
        description: 'description of apps:create',
        flags: {
          force: flags.boolean({ description: 'force it' }),
          app: flags.string({ char: 'a', hidden: true }),
          foo: flags.string({ char: 'f', description: 'foobar' }),
          remote: flags.string({ char: 'r' }),
        },
      }
    }
    expect(help.command(new CMD())).toEqual(`Usage: cli-engine apps:create [flags]

description of apps:create

Flags:
 -f, --foo FOO        foobar
 -r, --remote REMOTE
 --force              force it
`)
  })

  class AppsCreate1 extends Command {
    __config = {
      _version: '',
      id: 'apps:create',
    }
    options = {
      help: 'description of apps:create',
      flags: {
        force: flags.boolean({ description: 'force it' }),
        app: flags.string({ char: 'a', hidden: true }),
        foo: flags.string({ char: 'f', description: 'foobar' }),
        remote: flags.string({ char: 'r' }),
      },
    }
  }
  test('has description + help', () => {
    expect(help.command(new AppsCreate1())).toEqual(`Usage: cli-engine apps:create [flags]

Flags:
 -f, --foo FOO        foobar
 -r, --remote REMOTE
 --force              force it

description of apps:create
`)
  })

  class AppsCreate2 extends Command {
    __config = {
      _version: '',
      id: 'apps:create',
    }
    options = {
      description: 'description of apps:create',
      args: [{ name: 'app_name', description: 'app to use' }],
    }
  }

  test('has description + args', () => {
    expect(help.command(new AppsCreate2())).toEqual(`Usage: cli-engine apps:create [APP_NAME]

description of apps:create

APP_NAME  app to use
`)
  })

  class CMD extends Command {
    __config = {
      _version: '',
      id: 'apps:create',
    }
    options = {
      description: 'description of apps:create',
      aliases: ['foo', 'bar'],
      args: [{ name: 'app_name', description: 'app to use' }],
    }
  }
  test('has aliases', () => {
    expect(help.command(new CMD())).toEqual(`Usage: cli-engine apps:create [APP_NAME]

description of apps:create

Aliases:
  $ cli-engine foo
  $ cli-engine bar

APP_NAME  app to use
`)
  })
})

describe('command()', () => {
  test('has command help', () => {
    expect(help.commandLine(new AppsCreate())).toEqual(['apps:create [APP_NAME]', 'description of apps:create'])
  })
})
