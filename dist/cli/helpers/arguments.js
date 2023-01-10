import arg from 'arg';
import { PmtError } from '../../index.js';
export const parseArgs = () => {
    const argv = process.argv.slice(2);
    const [rawPrimaryArgs, ...rawRestArgs] = argv.join(' ').split(' -- ');
    const primaryArgs = rawPrimaryArgs.trim().split(' ');
    const secondaryArgs = rawRestArgs.join(' -- ');
    const parsedPrimaryArgs = arg({
        '--help': Boolean,
        '--version': Boolean,
        '--verbose': Boolean,
        '--env': String,
        '-h': '--help',
        '-v': '--version',
        '-e': '--env',
    }, { permissive: true, argv: primaryArgs });
    const commandName = primaryArgs.filter((a) => !a.startsWith('-'))[0];
    return {
        argv,
        primaryArgs,
        secondaryArgs,
        parsedPrimaryArgs,
        commandName,
    };
};
export const convertToCommandArgs = (command, { parsedPrimaryArgs: { _ }, secondaryArgs }) => {
    const spec = (command.options || []).reduce((acc, option) => {
        acc['--' + option.name] = option.boolean ? Boolean : String;
        for (const altName of option.altNames || []) {
            acc['-' + altName] = option.boolean ? Boolean : String;
        }
        return acc;
    }, {});
    const parsed = arg(spec, { permissive: true, argv: _ });
    const options = (command.options || []).reduce((acc, { name, altNames = [] }) => {
        if (parsed['--' + name]) {
            acc[name] = parsed['--' + name];
        }
        for (const altName of altNames) {
            if (parsed['-' + altName]) {
                acc[name] = parsed['-' + altName];
            }
        }
        return acc;
    }, {});
    const args = parsed._.slice(1);
    if (command.args.filter((a) => !a.optional).length > args.length) {
        throw new PmtError('missing-args', command);
    }
    return {
        args,
        options,
        secondary: secondaryArgs,
    };
};
export const shouldPrintHelp = ({ commandName, parsedPrimaryArgs }) => {
    if (commandName == 'help')
        return true;
    if (parsedPrimaryArgs['--help'] && parsedPrimaryArgs._.length == 0)
        return true;
    return false;
};
export const shouldPrintVersion = ({ parsedPrimaryArgs }) => {
    return parsedPrimaryArgs['--version'] || false;
};
export const shouldSetVerbose = ({ parsedPrimaryArgs }) => {
    return parsedPrimaryArgs['--verbose'] || false;
};
export const shouldLoadEnv = ({ parsedPrimaryArgs }) => {
    return !!parsedPrimaryArgs['--env'];
};
