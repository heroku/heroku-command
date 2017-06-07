// @flow

import Base, {CustomColors} from '.'
import chalk from 'chalk'

chalk.enabled = true
CustomColors.supports = {has256: true}

class Output extends Base {}

test('shows action', () => {
  const out = new Output({mock: true})
  out.action.start('1 doing a foo')
  out.stderr.log('2 here is a foo')
  out.stderr.log('3 here is another foo')
  out.action.stop()
  out.action.start('1 start')
  out.action.start('2 start')
  out.action.stop()
  expect(out.stderr.output).toEqual(`1 doing a foo...
2 here is a foo
3 here is another foo
1 doing a foo... done
1 start...
2 start... done\n`)
})

test('implicit done', async () => {
  const out = new Output({mock: true})
  out.action.start('doing a foo')
  await out.done()
  expect(out.stderr.output).toEqual('doing a foo... done\n')
})
