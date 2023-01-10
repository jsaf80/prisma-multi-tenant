import { CliArguments, Command, CommandArguments } from '../types.js';
export declare const parseArgs: () => CliArguments;
export declare const convertToCommandArgs: (command: Command, { parsedPrimaryArgs: { _ }, secondaryArgs }: CliArguments) => CommandArguments;
export declare const shouldPrintHelp: ({ commandName, parsedPrimaryArgs }: CliArguments) => boolean;
export declare const shouldPrintVersion: ({ parsedPrimaryArgs }: CliArguments) => boolean;
export declare const shouldSetVerbose: ({ parsedPrimaryArgs }: CliArguments) => boolean;
export declare const shouldLoadEnv: ({ parsedPrimaryArgs }: CliArguments) => boolean;
