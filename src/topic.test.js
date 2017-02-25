// @flow
/* globals
   test
   expect
*/

import Topic from './topic'
import Command from './command'
import Output from './output'

class PluginsTopic extends Topic {
  static topic = 'plugins'
}

const commands = [
  class extends Command {
    static topic = 'plugins'
  },
  class extends Command {
    static topic = 'plugins'
    static command = 'install'
    static description = 'installs a plugin'
  }
]

test('help()', async () => {
  let output = new Output({mock: true})
  const topic = new PluginsTopic(commands, output)
  await topic.help(['plugins'])
  expect(output.stdout.output).toContain('plugins:install # installs a plugin')
})
