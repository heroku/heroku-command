import { buildConfig, ICommand } from 'cli-engine-config'
import { flags as Flags } from 'cli-flags'
import * as nock from 'nock'
import { Command as Base } from './command'
import deps from './deps'

class Command extends Base {
  static topic = 'foo'
  static command = 'bar'
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

test('parses args', async () => {
  const { cmd } = await Command.mock(['one'])
  expect(cmd.flags).toEqual({})
  expect(cmd.argv).toEqual(['one'])
  expect(cmd.args).toEqual({ myarg: 'one' })
})

test('has help', async () => {
  class Command extends Base {
    static topic = 'config'
    static command = 'get'
    static help = `this is

some multiline help
`
    async run() {}
  }
  let config = buildConfig()
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
    command = new Command(buildConfig())
  })
  afterEach(() => {
    api.done()
  })

  test('makes an HTTP request', async () => {
    api = nock('https://api.heroku.com', {
      reqheaders: {
        'user-agent': `cli-engine/0.0.0 (darwin-x64) node-${process.version}`,
      },
    })
    api.get('/').reply(200, { message: 'ok' })

    let command = new Command(buildConfig({ platform: 'darwin', arch: 'x64' }))
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

    let command = new Command(buildConfig({ platform: 'darwin', arch: 'x64' }))
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
