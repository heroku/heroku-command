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
  const cmd = new Output({mock: true})
  cmd.action.start('doing a foo')
  cmd.action.stop()
  expect(cmd.stderr.output).toEqual('doing a foo... \ndoing a foo... done\n')
})
