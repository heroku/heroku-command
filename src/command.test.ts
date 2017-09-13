import { Command as Base } from './command'
import { flags } from 'cli-flags'
import * as nock from 'nock'

const config = { platform: 'darwin', arch: 'x64', argv: [] }

class Command extends Base {
  topic = 'foo'
  command = 'bar'
  parse = {
    flags: { myflag: flags.boolean() },
    args: [{ name: 'myarg', required: false }],
  }
}

let command: Command
beforeEach(async () => {
  command = new Command(config)
  await command.init()
})

test('shows the ID', () => {
  expect(command.id).toEqual('foo:bar')
})

test('runs the command', async () => {
  const { cmd } = await Command.mock()
  expect(cmd.flags).toEqual({})
  expect(cmd.argv).toEqual([])
})

test('has stdout', async () => {
  class Command extends Base {
    parse = {
      flags: {
        print: flags.string(),
        bool: flags.boolean(),
      },
    }
    async run() {
      this.cli.stdout.log(this.flags.print)
    }
  }

  const { stdout } = await Command.mock('--print=foo')
  expect(stdout).toEqual('foo\n')
})

test('has stderr', async () => {
  class Command extends Base {
    parse = {
      flags: { print: flags.string() },
    }
    async run() {
      this.cli.stderr.log(this.flags.print)
    }
  }

  const { stderr } = await Command.mock('--print=foo')
  expect(stderr).toEqual('foo\n')
})

test('parses args', async () => {
  const { cmd } = await Command.mock('one')
  expect(cmd.flags).toEqual({})
  expect(cmd.argv).toEqual(['one'])
  expect(cmd.args).toEqual({ myarg: 'one' })
})

test('has help', async () => {
  class Command extends Base {
    topic = 'config'
    command = 'get'
    help = `this is

some multiline help
`
  }
  let command = new Command(config)
  expect(command.buildHelp()).toEqual(`Usage: cli-engine config:get

this is

some multiline help\n`)
  expect(command.buildHelpLine()).toEqual(['config:get', null])
})

describe('http', () => {
  let api = nock('https://api.heroku.com')

  beforeEach(() => {
    api = nock('https://api.heroku.com')
    nock.disableNetConnect()
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

    let { body } = await command.http.get('https://api.heroku.com')
    expect(body).toEqual({ message: 'ok' })
  })

  describe('.post', async () => {
    test('makes a post request with body', async () => {
      api.post('/', { karate: 'chop', judo: 'throw', jujitsu: 'strangle' }).reply(200, { message: 'ok' })
      const body = {
        karate: 'chop',
        judo: 'throw',
        jujitsu: 'strangle',
      }

      await command.http.post('https://api.heroku.com', { body: body })
    })
  })
  test('stream', async () => {
    api = nock('https://api.heroku.com', {
      reqheaders: {
        'user-agent': `cli-engine/0.0.0 (darwin-x64) node-${process.version}`,
      },
    })
    api.get('/').reply(200, { message: 'ok' })

    const { response } = await command.http.stream('https://api.heroku.com')
    const body = JSON.parse(await concat(response))
    expect(body).toEqual({ message: 'ok' })
  })

  function concat(stream: NodeJS.ReadableStream) {
    return new Promise<string>(resolve => {
      let strings: string[] = []
      stream.on('data', data => strings.push(data))
      stream.on('end', () => resolve(strings.join('')))
    })
  }
})
