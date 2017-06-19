// @flow

import Output, {CustomColors} from '.'
import StreamOutput from './stream'
import chalk from 'chalk'
import moment from 'moment'
import fs from 'fs-extra'

jest.mock('fs-extra')
jest.mock('moment')

let env = process.env
beforeEach(() => {
  chalk.enabled = false
  CustomColors.supports = false
  process.env = {}
})

afterEach(() => {
  process.env = env
})

describe('StreamOutput', () => {
  test('mocks output', () => {
    let output = new Output({mock: true})
    let stderr = new StreamOutput(process.stderr, output)
    stderr.log('newline')
    expect(stderr.output).toEqual('newline\n')
  })

  test('writes to logfile', () => {
    let output = new Output({mock: true})
    let stderr = new StreamOutput(process.stderr, output)
    stderr.logfile = 'foo'
    moment.mockImplementationOnce(() => {
      return {
        format: jest.fn().mockReturnValueOnce('2017-blah')
      }
    })
    stderr.log('newline')
    expect(fs.appendFileSync).toBeCalledWith('foo', '[2017-blah] newline\n')
  })
})
