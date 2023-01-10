import { setManagementEnv } from './env.js'
import { clientManagementPath } from './constants.js'
import { requireDistant } from './shell.js'
import { Datasource } from './types.js'
import { PmtError } from './errors.js'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/index.js'

interface ManagementOptions {
  PrismaClient?: any
}

type Tenant = Datasource

export default class Management {
  private options?: ManagementOptions
  private client?: any

  constructor(options?: ManagementOptions) {
    this.options = options
  }

  private async getClient(): Promise<any> {
    if (this.client) return this.client

    await setManagementEnv()

    let PrismaClient

    if (this.options?.PrismaClient) {
      PrismaClient = this.options?.PrismaClient
    } else {
      try {
        PrismaClient = requireDistant(clientManagementPath).PrismaClient
      } catch {
        console.error(
          `\nError: Cannot find module '.prisma4-multi-tenant/management'.\n\nTry running "prisma4-multi-tenant generate"\n`
        )
        process.exit(1)
      }
    }

    this.client = new PrismaClient()
    return this.client
  }

  async create(tenant: Tenant): Promise<Tenant> {
    const client = await this.getClient()

    try {
      return await client.tenant.create({
        data: tenant,
      })
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError && err.code == 'P2002')
        throw new PmtError('tenant-already-exists', tenant.name)
      throw err
    }
  }

  async read(name: string): Promise<Tenant> {
    const client = await this.getClient()

    const tenant = await client.tenant.findUnique({ where: { name } })

    if (!tenant) {
      throw new PmtError('tenant-does-not-exist', name)
    }

    return this.sanitizeTenant(tenant)
  }

  async exists(name: string): Promise<boolean> {
    const client = await this.getClient()

    const tenant = await client.tenant.findUnique({ where: { name } })

    return !!tenant
  }

  async list(): Promise<Tenant[]> {
    const client = await this.getClient()

    const tenants = await client.tenant.findMany()

    return tenants.map(this.sanitizeTenant)
  }

  async update(name: string, update: Tenant): Promise<Tenant> {
    const client = await this.getClient()

    try {
      return await client.tenant.update({
        where: { name },
        data: update,
      })
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError && err.message.includes('RecordNotFound'))
        throw new PmtError('tenant-does-not-exist', name)
      throw err
    }
  }

  async delete(name: string): Promise<Tenant> {
    const client = await this.getClient()

    try {
      return await client.tenant.delete({ where: { name } })
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError && err.message.includes('RecordNotFound'))
        throw new PmtError('tenant-does-not-exist', name)
      throw err
    }
  }

  disconnect(): Promise<void> {
    if (!this.client) return Promise.resolve()

    return this.client.$disconnect()
  }

  private sanitizeTenant(tenant: Tenant): Tenant {
    // return {
    //   name: tenant.name,
    //   provider: "",
    //   url: tenant.url,
    // }
    const newTenant: { name: string; url: string } = {
      name: tenant.name,
      url: tenant.url,
    }
    return newTenant as unknown as Datasource
  }
}
