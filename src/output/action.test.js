// @flow

import Base, {CustomColors} from '.'
import chalk from 'chalk'

chalk.enabled = true
CustomColors.supports = {has256: true}

class Output extends Base {}

test('shows action', () => {
  const out = new Output({mock: true})
  out.action.start('doing a foo')
  out.stderr.log('here is a foo')
  out.stderr.log('here is another foo')
  out.action.stop()
  expect(out.stderr.output).toEqual(`doing a foo...
here is a foo
here is another foo
doing a foo... done\n`)
})

test('implicit done', async () => {
  const out = new Output({mock: true})
  out.action.start('doing a foo')
  await out.done()
  expect(out.stderr.output).toEqual('doing a foo... done\n')
})
