import { createRequire } from 'module'
const require = createRequire(import.meta.url)
import { exec } from 'child_process'
import { MultiTenant } from 'prisma4-multi-tenant'

import { fileExists } from 'prisma4-multi-tenant'
import path from 'path'
import * as fs from 'fs'
import * as util from 'util'
const __dirname = path.dirname(new URL(import.meta.url).pathname)
import { jest } from '@jest/globals'
jest.setTimeout(100000)
describe('migrate', () => {
  test('create', async () => {
    expect.assertions(10)
    let multiTenant = new MultiTenant()

    const tenant1 = await multiTenant.createTenant({
      name: 'test-migrate-1',
      url: 'file:test-migrate-1.db',
    })

    expect(tenant1).toBeDefined()
    expect(tenant1._meta).toStrictEqual({ name: 'test-migrate-1' })
    expect(tenant1).toBeInstanceOf(multiTenant.ClientTenant)
    expect(multiTenant.tenants['test-migrate-1']).toBe(tenant1)
    expect(fileExists(path.join(__dirname, '../prisma/test-migrate-1.db')))
      .resolves.toBe(true)
      .then(async () => await multiTenant.disconnect())

    const tenant2 = await multiTenant.createTenant({
      name: 'test-migrate-2',
      url: 'file:test-migrate-2.db',
    })

    expect(tenant2).toBeDefined()
    expect(tenant2._meta).toStrictEqual({ name: 'test-migrate-2' })
    expect(tenant2).toBeInstanceOf(multiTenant.ClientTenant)
    expect(multiTenant.tenants['test-migrate-2']).toBe(tenant2)
    await expect(fileExists(path.join(__dirname, '../prisma/test-migrate-2.db')))
      .resolves.toBe(true)
      .then(async () => await multiTenant.disconnect())
      .then(() => {
        return true
      })
  })

  test('migrate', async () => {
    const multiTenant = new MultiTenant()

    const fse = require('fs-extra')

    const srcFile = path.join(__dirname, '../prisma/schema2.prisma')
    const destFile = path.join(__dirname, '../prisma/schema.prisma')

    await fse.copySync(
      srcFile,
      destFile,
      {
        overwrite: true,
      },
      (err: any) => {
        if (err) {
          console.error(err)
        } else {
          console.log('success!')
        }
      }
    )
    await runShell('npx p4mt migrate dev prepare-deploy')
      .then(async () => {
        expect(await multiTenant.migrateTenants()).toEqual(
          expect.arrayContaining([
            { name: 'dev', url: 'file:dev.db' },
            { name: 'test1', url: 'file:dev1.db' },
            { name: 'test-create-1', url: 'file:test-create-1.db' },
            { name: 'test-migrate-1', url: 'file:test-migrate-1.db' },
            { name: 'test-exists-1', url: 'file:test-exists-1.db' },
            { name: 'test-migrate-2', url: 'file:test-migrate-2.db' },
          ])
        )
      })
      .then(async () => await multiTenant.disconnect())
      .then(() => {
        return true
      })
  })
})

const runShell = async (cmd: string, cwd: string = ''): Promise<string> => {
  return await new Promise(async (resolve, reject) => {
    return await exec(
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
