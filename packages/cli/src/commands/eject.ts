import chalk from 'chalk'

import { runShell } from '@prisma4-multi-tenant/shared'

import { Command } from '../types'
import { useYarn } from '../helpers/misc'

class Eject implements Command {
  name = 'eject'
  args = []
  description = 'Eject prisma4-multi-tenant from your application'

  async execute() {
    console.log(chalk`\n  {yellow Ejecting \`prisma4-multi-tenant\` from your app...}`)

    const yarnOrNpm = (await useYarn()) ? 'yarn remove' : 'npm uninstall'

    await runShell(`${yarnOrNpm} @prisma4-multi-tenant/client`)

    console.log(
      chalk`\n✅  {green Successfully removed \`@prisma4-multi-tenant/client\` from your app. Bye! 👋}\n`
    )
  }
}

export default new Eject()
