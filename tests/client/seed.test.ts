import { createRequire } from 'module'
const require = createRequire(import.meta.url)
import { exec } from 'child_process'
import { MultiTenant } from 'prisma4-multi-tenant'

import path from 'path'
import * as fs from 'fs'
import * as util from 'util'
const __dirname = path.dirname(new URL(import.meta.url).pathname)
const multiTenant = new MultiTenant()
let tenantnames: Array<string> = []
await multiTenant
  .listTenants()
  .then((tenants) => {
    for (const tenant of tenants) {
      tenantnames.push(tenant)
    }
  })
  .then(() => {
    return true
  })

describe('seed', () => {
  test.each(tenantnames)('%s', async (a: string) => {
    const prisma = await multiTenant.get(a)
    return expect(await seed(prisma, a)).toEqual('Successfully seeded')
  })
})
afterAll(async () => {
  return await multiTenant.disconnect()
})

const seed = async (prisma, name): Promise<string> => {
  try {
    const userSeeded = await prisma.user.create({
      data: {
        name: 'Jane',
        surname: 'Doe',
        email: Math.random() + '@jane.doe',
      },
    })
    const user = await prisma.user.findUnique({
      where: { id: userSeeded.id },
    })
    if (user.name == 'Jane' && user.email.endsWith('@jane.doe')) {
      return 'Successfully seeded'
    } else {
      return 'Unknown error during seeding'
    }
  } catch (e) {
    return 'Error in ' + name + ': ' + e
  }
}

const runShell = async (cmd: string, cwd: string = ''): Promise<string> => {
  return await new Promise(async (resolve, reject) => {
    await exec(
      cmd,
      {
        cwd: cwd,
        env: {
          ...process.env,
          PMT_TEST: 'true',
        },
      },
      (error, stdout, stderr) => {
        if (error) reject(error)
        resolve(stdout)
      }
    )
  })
}
var log_file = fs.createWriteStream(__dirname + '/debug.log', { flags: 'w' })
var log_stdout = process.stdout

console.log = function (d) {
  //
  log_file.write(util.format(d) + '\n')
  log_stdout.write(util.format(d) + '\n')
}
