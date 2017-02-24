// @flow

/* globals
  test
  expect
  */

import Base, {CustomColors} from '.'
import chalk from 'chalk'

chalk.enabled = true
CustomColors.supports = {has256: true}

class Output extends Base {}

test('shows action', () => {
  const out = new Output({mock: true})
  out.action.start('doing a foo')
  out.action.stop()
  expect(out.stderr.output).toEqual('doing a foo... \ndoing a foo... done\n')
})

test('implicit done', async () => {
  const out = new Output({mock: true})
  out.action.start('doing a foo')
  await out.done()
  expect(out.stderr.output).toEqual('doing a foo... \ndoing a foo... done\n')
})
