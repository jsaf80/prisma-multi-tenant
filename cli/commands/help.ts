import { Command } from '../types.js'

class Help implements Command {
  name = 'help'
  args = []
  description = 'Display this help'

  async execute() {
    // Do nothing, printing global help is handled by src/cli/index.ts
  }
}

export default new Help()
