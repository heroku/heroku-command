import { Config, ICommand } from '@cli-engine/config'
import { flags as Flags } from 'cli-flags'
import * as nock from 'nock'

import { Command as Base } from './command'
import deps from './deps'
import { HelpErr } from './errors'

class Command extends Base {
  static id = 'foo:bar'
  static flags = { myflag: Flags.boolean() }
  static args = [{ name: 'myarg', required: false }]

  async run() {
    deps.cli!.log('foo')
  }
}

test('it meets the interface', () => {
  let c: ICommand = Command
  expect(c).toBeDefined()
})

test('shows the ID', () => {
  expect(Command.id).toEqual('foo:bar')
})

test('runs the command', async () => {
  const { cmd, stdout } = await Command.mock()
  expect(cmd.flags).toEqual({})
  expect(cmd.argv).toEqual([])
  expect(stdout).toEqual('foo\n')
})

test('has stdout', async () => {
  class Command extends Base {
    static flags = { print: Flags.string(), bool: Flags.boolean() }
    async run() {
      deps.cli!.stdout.log(this.flags.print)
    }
  }

  const { stdout } = await Command.mock(['--print=foo'])
  expect(stdout).toEqual('foo\n')
})

test('has stderr', async () => {
  class Command extends Base {
    static flags = { print: Flags.string() }
    async run() {
      deps.cli!.stderr.log(this.flags.print)
    }
  }

  const { stderr } = await Command.mock(['--print=foo'])
  expect(stderr).toEqual('foo\n')
})

describe('parsing', () => {
  test('parses args', async () => {
    const { cmd } = await Command.mock(['one'])
    expect(cmd.flags).toEqual({})
    expect(cmd.argv).toEqual(['one'])
    expect(cmd.args).toEqual({ myarg: 'one' })
  })

  describe('help', () => {
    test('allows "-h" as an argument', async () => {
      const { cmd } = await Command.mock(['-h'])
      expect(cmd.argv).toEqual(['-h'])
      expect(cmd.args).toEqual({ myarg: '-h' })
    })

    test('raises help error when "-h" is unexpected', async () => {
      expect.assertions(1)
      try {
        await Command.mock(['foo', '-h'])
      } catch (err) {
        expect(err).toBeInstanceOf(HelpErr)
      }
    })

    test('raises help error when "help" is unexpected', async () => {
      expect.assertions(1)
      try {
        await Command.mock(['foo', 'help'])
      } catch (err) {
        expect(err).toBeInstanceOf(HelpErr)
      }
    })

    test('does not raise help error when not a help string', async () => {
      expect.assertions(1)
      try {
        await Command.mock(['foo', 'bar'])
      } catch (err) {
        expect(err).not.toBeInstanceOf(HelpErr)
      }
    })
  })
})

test('has help', async () => {
  class Command extends Base {
    static id = 'config:get'
    static help = `this is

some multiline help
`
    async run() {}
  }
  let config = new Config()
  expect(Command.buildHelp(config)).toEqual(`Usage: cli-engine config:get

this is

some multiline help\n`)
  expect(Command.buildHelpLine(config)).toEqual(['config:get', undefined])
})

describe('http', () => {
  let api: nock.Scope
  let command: Command

  beforeEach(() => {
    api = nock('https://api.heroku.com')
    nock.disableNetConnect()
    command = new Command(new Config())
  })
  afterEach(() => {
    api.done()
  })

  test('makes an HTTP request', async () => {
    api = nock('https://api.heroku.com', {
      reqheaders: {
        'user-agent': `cli-engine/0.0.0 (freebsd-x86) node-${process.version}`,
      },
    })
    api.get('/').reply(200, { message: 'ok' })

    let command = new Command(new Config({ platform: 'freebsd', arch: 'x86' }))
    let { body } = await command.http.get('https://api.heroku.com')
    expect(body).toEqual({ message: 'ok' })
  })

  describe('.post', async () => {
    test('makes a post request with body', async () => {
      api.post('/', { karate: 'chop', judo: 'throw', jujitsu: 'strangle' }).reply(200, { message: 'ok' })
      const body = { karate: 'chop', judo: 'throw', jujitsu: 'strangle' }

      await command.http.post('https://api.heroku.com', { body })
    })
  })
  test('stream', async () => {
    api = nock('https://api.heroku.com', {
      reqheaders: {
        'user-agent': `cli-engine/0.0.0 (darwin-x64) node-${process.version}`,
      },
    })
    api.get('/').reply(200, { message: 'ok' })

    let command = new Command(new Config({ platform: 'darwin', arch: 'x64' }))
    const { response } = await command.http.stream('https://api.heroku.com')
    const body = JSON.parse(await concat(response))
    expect(body).toEqual({ message: 'ok' })
  })

  function concat(stream: NodeJS.ReadableStream): Promise<string> {
    return new Promise(resolve => {
      let strings: string[] = []
      stream.on('data', data => strings.push(data))
      stream.on('end', () => resolve(strings.join('')))
    })
  }
})

describe('deprecate', () => {
  const util = require('util')
  const { deprecate: origDeprecate } = util

  beforeEach(() => {
    util.deprecate = jest.fn().mockImplementation(fn => () => {
      fn()
    })
  })

  afterEach(() => {
    util.deprecate = origDeprecate
  })

  test('allows deprecated input', async () => {
    class Command extends Base {
      static flags = { myflag: Flags.string() }
      async run() {
        deps.cli!.log(this.flags.myflag)
      }
    }

    const { stdout } = await Command.mock('--myflag' as any, 'foo' as any)
    expect(stdout).toEqual('foo\n')
  })
})
