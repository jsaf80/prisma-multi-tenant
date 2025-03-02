import path from 'path'
import chalk from 'chalk'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)

const __dirname = path.dirname(new URL(import.meta.url).pathname)
// This is quick and dirty, but currently works
const compareVersions = (a: string, b: string) => {
  const aParts = a.split('.')
  const bParts = b.split('.')

  for (const i in aParts) {
    if (aParts[i] > bParts[i]) {
      return 1
    } else if (aParts[i] < bParts[i]) {
      return -1
    }
  }

  return 0
}

export default async (): Promise<void> => {
  try {
    let prismaVersion

    try {
      prismaVersion = require('prisma/package.json').version
    } catch {
      console.warn(
        chalk.yellow(
          `Warning: Couldn't find "prisma" in node_modules. Did you forget to install it locally?`
        )
      )
      return
    }

    const { dependencies } = require(path.join(__dirname, '../../package.json'))
    const prismaVersionRequired = dependencies['prisma'].replace('^', '')

    if (compareVersions(prismaVersion, prismaVersionRequired) == -1) {
      console[process.env.PMT_TEST ? 'log' : 'warn'](
        chalk.yellow(
          `Warning: This version of prisma4-multi-tenant is compatible with prisma@${prismaVersionRequired}, but you have prisma@${prismaVersion} installed. This may break in unexpected ways.`
        )
      )
      return
    }
  } catch (e) {
    console.log(e)
    console.warn(
      chalk.yellow(
        `Warning: Couldn't verify version compatibility with "prisma". Did you forget to install it locally?`
      )
    )
  }
}
