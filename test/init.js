import nock from 'nock'
import chalk from 'chalk'
import cli from 'cli-ux'

chalk.enabled = false

nock.disableNetConnect()

beforeEach(() => {
  cli.config.mock = true
})
