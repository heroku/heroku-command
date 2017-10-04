process.env.FORCE_COLOR = 0

const nock = require('nock')
nock.disableNetConnect()

beforeEach(() => {
  require('cli-ux').default.config.mock = true
})
