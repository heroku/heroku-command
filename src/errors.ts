export class HelpErr extends Error {
  showHelp = true

  constructor(message: string) {
    super(message)
  }
}
