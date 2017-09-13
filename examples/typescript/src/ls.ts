const { Command, flags } = require('cli-engine-command')
const fs = require('fs')

class LS extends Command {
  Flags = {
    dir: flags.string({
      char: 'd',
      default: process.cwd(),
    }),
  }

  async run() {
    let files = fs.readdirSync(this.flags.dir)
    for (let f of files) {
      this.out.log(f)
    }
  }
}
LS.run()
