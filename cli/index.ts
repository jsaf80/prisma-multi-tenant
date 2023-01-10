#!/usr/bin/env node

import path from 'path'

import { PmtError, Management } from '../index.js'

import * as commands from './commands/index.js'
import {
  parseArgs,
  convertToCommandArgs,
  shouldPrintHelp,
  shouldPrintVersion,
  shouldSetVerbose,
  shouldLoadEnv,
} from './helpers/arguments.js'
import { printError } from './helpers/errors.js'
import help from './helpers/help.js'
import { loadEnv } from './helpers/env.js'
import checkCompatibility from './helpers/checkCompatibility.js'
import { Command } from './types.js'
import dotenv from 'dotenv'

loadEnv()

const args = parseArgs()
let management: Management

const run = async (): Promise<void> => {
  // Priting help
  if (shouldPrintHelp(args)) {
    return help.printGlobalHelp()
  }

  // Printing version
  if (shouldPrintVersion(args)) {
    return help.printGlobalVersion()
  }

  // Setting verbosity
  if (shouldSetVerbose(args)) {
    process.env.verbose = 'true'
    process.env.VERBOSE = 'true'
  }

  // Loading env file
  if (shouldLoadEnv(args)) {
    dotenv.config({
      path: path.resolve(process.cwd(), args.parsedPrimaryArgs['--env'] || ''),
    })
  }

  // Check version compatibility
  await checkCompatibility()

  const { parsedPrimaryArgs, commandName } = args

  // Finding command
  const command: Command | undefined = Object.values(commands).find(
    (c: Command) => c.name == commandName || c.altNames?.includes(commandName)
  )

  if (!command) {
    throw new PmtError('unrecognized-command', commandName)
  }

  if (parsedPrimaryArgs['--help']) {
    help.printCommandHelp(command)
    return
  }

  management = new Management()

  // Executing command
  await command.execute(convertToCommandArgs(command, args), management)
}

run()
  .then(async () => {
    if (management) {
      await management.disconnect()
    }
  })
  .catch(async (err) => {
    printError(err, args)
    if (management) {
      await management.disconnect()
    }
    process.exit(1)
  })
