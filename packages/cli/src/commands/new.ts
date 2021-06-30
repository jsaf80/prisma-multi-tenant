import path from 'path'
import chalk from 'chalk'

import {
  Management,
  PmtError,
  getSchemaPath,
  translateDatasourceUrl,
} from '@prisma2-multi-tenant/shared'

import { Command, CommandArguments } from '../types'
import prompt from '../helpers/prompt'

import migrate from './migrate'

class New implements Command {
  name = 'new'
  altNames = ['add']
  args = [
    {
      name: 'management',
      optional: true,
      description: 'Create a new management',
    },
  ]
  options = [
    {
      name: 'name',
      description: 'Name of the tenant',
    },
    {
      name: 'provider',
      description: 'Provider of the management database. Required for new management. Not used for new Tenant',
    },
    {
      name: 'url',
      description: 'URL of the database',
    },
    {
      name: 'schema',
      description: 'Specify path of schema',
    },
    {
      name: 'no-management',
      description: 'The new tenant will not be registered in the management database',
      boolean: true,
    },
  ]
  description = 'Create a new tenant or management'

  async execute(args: CommandArguments, management: Management) {
    if (args.args[0] === 'management') {
      await this.newManagement(args)
    } else {
      await this.newTenant(args, management)
    }
  }

  async newManagement(args: CommandArguments) {
    console.log()
    const { url: databaseUrl, provider: databaseProvider } = await prompt.managementConf(args)

    const schemaPath = args.options.schema || (await getSchemaPath())

    process.env.MANAGEMENT_PROVIDER = databaseProvider
    process.env.MANAGEMENT_URL = translateDatasourceUrl(databaseUrl, path.dirname(schemaPath))

    await migrate.setupManagement('push')

    console.log(chalk`\n✅  {green Successfuly created a new management database!}\n`)
  }

  async newTenant(args: CommandArguments, management: Management) {
    console.log()
    const tenant = await prompt.tenantConf(args)

    if (tenant.name == 'management') {
      throw new PmtError('reserved-tenant-name', 'management')
    }

    await migrate.migrateTenant('deploy', tenant, args.options.schema)

    if (args.options['no-management']) {
      console.log(
        chalk`\n✅  {green Created the new tenant (without management) and migrated up the database}\n`
      )
      return
    }

    await management.create(tenant)

    console.log(
      chalk`\n✅  {green Registered the new tenant into management and migrated up the database!}\n`
    )
  }
}

export default new New()
