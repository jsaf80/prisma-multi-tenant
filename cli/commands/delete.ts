import chalk from 'chalk'

import Management from '../../shared/management.js'

import { Command, CommandArguments } from '../types.js'
import prompt from '../helpers/prompt.js'

class Delete implements Command {
  name = 'delete'
  altNames = ['remove']
  args = [
    {
      name: 'name',
      description: 'Name of the tenant you want to delete',
    },
  ]
  options = [
    {
      name: 'schema',
      description: 'Specify path of schema',
    },
    {
      name: 'force',
      description: 'Delete the tenant without asking for confirmation',
      boolean: true,
    },
  ]
  description = 'Delete one tenant'

  async execute(args: CommandArguments, management: Management) {
    console.log()

    const [name] = args.args

    if (
      !args.options.force &&
      !(await prompt.confirm(
        `${chalk.red(`Are you sure you want to delete the tenant "${name}"?`)}`
      ))
    ) {
      return
    }

    // Database should not be reset for security reasons
    // await migrate.migrateOneTenant(management, 'reset', name, args.options.schema).catch((e) => {
    //   if (args.options.force) {
    //     console.error(e)
    //   } else {
    //     throw e
    //   }
    // })
    await management.delete(name)

    console.log(`\n✅  ${chalk.green(`"${name}" has been deleted it from management!`)}\n`)
    console.log(
      `  ${chalk.yellow(
        `${chalk.bold(`Note:`)} You are still in charge of deleting the database!`
      )}\n`
    )
  }
}

export default new Delete()
