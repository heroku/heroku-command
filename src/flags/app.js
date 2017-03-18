// @flow

import {Flag, type IFlag} from '../flag'

type Options = $Shape<IFlag<string>>
export default function AppFlag (options: Options, env: typeof process.env = process.env): IFlag<string> {
  const envApp = env.HEROKU_APP
  const defaultOptions: Options = {
    char: 'a',
    description: 'app to run command against',
    default: () => envApp,
    parse: (input) => {
      if (input) return input
      if (envApp) return envApp
      if (options.required) throw new Error('nme goes here')
    }
  }
  return Flag(Object.assign(defaultOptions, options))
}

// import type Command from '../command' // eslint-disable-line
// import {ValueFlag} from '../flag'
// import {vars} from './heroku'
// import Git from '../git'

// export class RemoteFlag extends ValueFlag {
//   static char = 'r'
//   static description = 'git remote of app to use'
// }

// type Options = {
//   required?: ?boolean
// }

// export default class App {
//   cmd: Command<*>
//   options: Options
//   git: Git
//   configRemote: ?string
//   _gitRemotes: {remote: string, app: string}[]

//   constructor (cmd: Command<*>, options: Options = {required: false}) {
//     this.cmd = cmd
//     this.options = options
//     this.git = new Git()
//     try { this.configRemote = this.git.exec('config heroku.remote').trim() } catch (err) { }
//   }

//   get name (): ?string {
//     // let app = this.cmd.flags.app || process.env.HEROKU_APP || this.gitRemoteApp
//     // if (!app && this.options.required) throw new Error('No app specified')
//     // return app
//   }

//   get gitRemoteApp (): ?string {
//     if (this.gitRemotes.length === 0) {
//       if (this.configRemote) throw new Error(`No remote found for ${this.configRemote} specified in .git/config`)
//       return
//     }
//     let remoteFlag = 'foobar'
//     // let remoteFlag = this.cmd.flags.remote.value
//     if (remoteFlag) {
//       let remote = this.gitRemotes.find(r => r.remote === remoteFlag)
//       if (remote) return remote.app
//       throw new Error(`remote ${remoteFlag} not found in git remotes`)
//     }
//     if (this.gitRemotes.length > 1) {
//       throw new Error(`Multiple apps in git remotes
// Usage: --remote ${this.gitRemotes[1].remote}
//    or: --app ${this.gitRemotes[1].app}
// Your local git repository has more than 1 app referenced in git remotes.
// Because of this, we can't determine which app you want to run this command against.
// Specify the app you want with %s or %s.
// Heroku remotes in repo:
// ${this.gitRemotes.map(r => `${r.app} (${r.remote})`).join('\n')}

// https://devcenter.heroku.com/articles/multiple-environments`)
//     }
//     return this.gitRemotes[0].app
//   }

//   get gitRemotes (): {remote: string, app: string}[] {
//     if (this._gitRemotes) return this._gitRemotes
//     this._gitRemotes = []
//     let remotes = []
//     try {
//       remotes = this.git.remotes
//     } catch (err) { }
//     for (let remote of remotes) {
//       if (this.configRemote && remote.name !== this.configRemote) continue
//       for (let prefix of vars.gitPrefixes) {
//         const suffix = '.git'
//         let match = remote.url.match(`${prefix}(.*)${suffix}`)
//         if (!match) continue
//         this._gitRemotes.push({
//           remote: remote.name,
//           app: match[1]
//         })
//       }
//     }
//     return this._gitRemotes
//   }
// }
