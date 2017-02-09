const flatten = list => list.reduce((a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), [])

class CommandList extends Array {
  constructor (...commands) {
    super(...flatten(commands))
  }

  find (cmd) {
    if (typeof cmd === 'function') return super.find(cmd)
    if (!cmd) return
    let [topic, ...command] = cmd.split(':')
    command = command.join(':')
    let c = this.find(c => command
      ? topic === c.topic && command === c.command
      : topic === c.topic && !c.command)
    if (c) return c
    return this.find(c => (c.aliases || []).includes(cmd))
  }
}

module.exports = CommandList
