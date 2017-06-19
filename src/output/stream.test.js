// @flow

import Output from '.'
import StreamOutput from './stream'
import moment from 'moment'
import fs from 'fs-extra'

jest.mock('fs-extra')
jest.mock('moment')

let env = process.env
beforeEach(() => {
  process.env = {}
  StreamOutput.startOfLine = true
})

afterEach(() => {
  process.env = env
})

test('mocks output', () => {
  let output = new Output({mock: true})
  let stderr = new StreamOutput(process.stderr, output)
  stderr.log('newline')
  expect(stderr.output).toEqual('newline\n')
})

test('does not write to logfile', () => {
  let output = new Output({mock: true})
  let stderr = new StreamOutput(process.stderr, output)
  stderr.logfile = 'foo'
  stderr.write('data to write', {log: false})
  expect(fs.appendFileSync).not.toBeCalled()
  expect(stderr.output).toEqual('data to write')
})

describe('with moment mocked', () => {
  beforeEach(() => {
    moment.mockImplementationOnce(() => {
      return {
        format: jest.fn().mockReturnValueOnce('2017')
      }
    })
  })

  test('writes to logfile', () => {
    let output = new Output({mock: true})
    let stderr = new StreamOutput(process.stderr, output)
    stderr.logfile = 'foo'
    stderr.log('newline')
    expect(fs.appendFileSync).toBeCalledWith('foo', '[2017] newline\n')
  })

  test('shows timestamp when BINNAME_TIMESTAMP=1', () => {
    process.env.CLI_ENGINE_TIMESTAMPS = '1'
    let output = new Output({mock: true})
    let stderr = new StreamOutput(process.stderr, output)
    stderr.log('newline')
    expect(stderr.output).toEqual('[2017] newline\n')
  })
})
