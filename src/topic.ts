import { Command } from './command'
import { Topic as ITopic } from 'cli-engine-config'

export const Topic: ITopic = class Topic {
  constructor(commands: typeof Command[]) {
    this.commands = commands
  }

  static topic: string
  static description: string | undefined
  static hidden = false

  commands: typeof Command[]

  static get id(): string {
    return this.topic
  }
}
