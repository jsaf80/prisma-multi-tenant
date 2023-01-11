import { findUp } from 'find-up'
import { exec, spawn } from 'child_process'
import * as path from 'path'
import * as fs from 'fs'
import chalk from 'chalk'

import { PmtError } from './errors.js'
import { clientManagementPath } from './constants.js'
import { Datasource } from './types.js'
import { getManagementEnv } from './env.js'
import * as console from 'console'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)

const __dirname = path.dirname(new URL(import.meta.url).pathname)

// Cache nodeModulesPath
let nodeModulesPath: string

export const runShell = (
  cmd: string,
  options?: { cwd: string; env?: { [name: string]: string | undefined } }
): Promise<string | Buffer> => {
  if (process.env.verbose == 'true') {
    console.log('  $> ' + cmd)
  }

  return new Promise((resolve, reject) => {
    exec(cmd, options, (error: Error | null, stdout: string | Buffer, stderr: string | Buffer) => {
      if (process.env.verbose == 'true') {
        console.log(stderr || stdout)
      }
      if (error) reject(error)
      resolve(stdout)
    })
  })
}

export const spawnShell = (cmd: string): Promise<number> => {
  const [command, ...commandArguments] = cmd.split(' ')
  return new Promise((resolve) =>
    spawn(command, commandArguments, {
      stdio: 'inherit',
      env: process.env,
      shell: true,
    }).on('exit', (exitCode: number) => resolve(exitCode))
  )
}

export const fileExists = async (path: string): Promise<boolean | string> => {
  try {
    await fs.promises.access(path, fs.constants.R_OK)
    return true
  } catch (e) {
    return false
  }
}

export const getNodeModules = async (cwd?: string): Promise<string> => {
  if (nodeModulesPath) return nodeModulesPath

  let currentPath = cwd || process.cwd()

  do {
    if (await fileExists(path.join(currentPath, 'node_modules'))) {
      nodeModulesPath = path.join(currentPath, 'node_modules')
    } else {
      if (currentPath != path.join(currentPath, '../')) {
        currentPath = path.join(currentPath, '../')
      } else {
        throw new PmtError('no-nodes-modules')
      }
    }
  } while (!nodeModulesPath)

  return nodeModulesPath
}

// Run in this directory
export const getSharedPath = async (): Promise<string | undefined> => {
  const sharedPath = await findUp('node_modules/prisma4-multi-tenant/dist/shared')
  return sharedPath != null ? sharedPath : __dirname
}

// Run in this directory
export const runLocal = async (
  cmd: string,
  env?: { [name: string]: string }
): Promise<string | Buffer> => {
  const sharedPath = await findUp('node_modules/prisma4-multi-tenant/dist/shared')

  return runShell(cmd, {
    cwd: sharedPath || '',
    env: {
      ...process.env,
      ...env,
    },
  })
}

// Run from the place where the CLI was called
export const runDistant = (cmd: string, tenant?: Datasource): Promise<string | Buffer> => {
  return runShell(cmd, {
    cwd: process.cwd(),
    env: {
      ...process.env,
      DATABASE_URL: tenant?.url || process.env.DATABASE_URL || 'PMT_TMP_URL',
    },
  })
}

export const getPrismaCliPath = async (): Promise<string> => {
  //const nodeModules = await getNodeModules()
  //return path.join(nodeModules, '@prisma/cli/build/index.js')
  const path = await findUp('node_modules/prisma/build/index.js')
  if (!path) {
    throw new Error('Cannot find "prisma"')
  }
  return path
}

export const getPrisma4MultiTenantPath = async (): Promise<string> => {
  //const nodeModules = await getNodeModules()
  //return path.join(nodeModules, '@prisma/cli/build/index.js')
  const path = await findUp(process.cwd() + 'node_modules/prisma4-multi-tenant/index.js')
  if (!path) {
    throw new Error('Cannot find "prisma"')
  }
  return path
}

export const isPrismaCliLocallyInstalled = async (): Promise<boolean> => {
  return getPrismaCliPath()
    .then(() => true)
    .catch(() => false)
}

export const isPrisma4MultiTenantLocallyInstalled = async (): Promise<boolean> => {
  return getPrisma4MultiTenantPath()
    .then(() => true)
    .catch(() => false)
}

export const runLocalPrisma = async (cmd: string): Promise<string | Buffer> => {
  const prismaCliPath = await getPrismaCliPath()

  const managementEnv = await getManagementEnv()

  const nodeModules = await getNodeModules()

  const PMT_OUTPUT = path.join(nodeModules, clientManagementPath)
  const schemaPath = path.join(__dirname, 'prisma/schema.prisma')

  return runLocal(`npx "${prismaCliPath}" ${cmd} --schema="${schemaPath}"`, {
    ...managementEnv,
    PMT_OUTPUT,
  })
}

export const runDistantPrisma = async (
  cmd: string,
  tenant?: Datasource,
  withTimeout = true
): Promise<string | Buffer> => {
  const prismaCliPath = await getPrismaCliPath()
  const promise = runDistant(`npx "${prismaCliPath}" ${cmd}`, tenant)

  if (!withTimeout) {
    return promise
  }

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      const altCmd =
        (tenant?.name ? `prisma4-multi-tenant env ${tenant.name} -- ` : '') + 'npx prisma ' + cmd
      if (chalk) {
        console.log(
          `\n  ${chalk.yellow(
            `Note: Prisma seems to be unresponsive. Try running \`${altCmd.trim()}\``
          )}\n`
        )
      } else {
        console.log(`Note: Prisma seems to be unresponsive. Try running \`${altCmd.trim()}\`}`)
      }
    }, 30 * 1000)

    promise
      .then((value) => {
        clearTimeout(timeout)
        resolve(value)
      })
      .catch((err) => {
        clearTimeout(timeout)
        reject(err)
      })
  })
}

export const requireDistant = (name: string): any => {
  // Keep previous env so that the required module doesn't update it
  const previousEnv = { ...process.env }
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const required = require(require.resolve(name, {
    paths: [
      process.cwd() + '/node_modules/',
      process.cwd(),
      ...(require.main?.paths || []),
      __dirname + '/../../../',
    ],
  }))
  process.env = previousEnv
  return required
}
