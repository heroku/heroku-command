module.exports = (cmd, commands) => {
  let [topic, ...command] = cmd.split(':')
  command = command.join(':')
  let c = this.commands.find(c => command
    ? topic === c.topic && command === c.command
    : topic === c.topic && !c.command)
  if (c) return c
  return this.commands.find(c => (c.aliases || []).includes(cmd))
}
