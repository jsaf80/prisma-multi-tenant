import chalk from 'chalk';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import * as commands from '../commands/index.js';
const packageJson = require('../../package.json');
const printGlobalHelp = () => {
    console.log(chalk `
  ${chalk.bold.cyan(`🧭  prisma4-multi-tenant} ${chalk.grey(`v${packageJson.version}`)}`)}

  ${chalk.bold(`USAGE`)}

    ${chalk.bold.italic(`prisma4-multi-tenant`)} [command] [args]

    ${chalk.grey(`Examples:`)}
        ${chalk.grey(`prisma4-multi-tenant new`)}
        ${chalk.grey(`prisma4-multi-tenant migrate my_tenant up`)}
        ${chalk.grey(`prisma4-multi-tenant env my_tenant -- npx prisma introspect`)}
        ${chalk.grey(`...`)}

  ${chalk.bold `COMMANDS`}

${Object.values(commands)
        .map((command) => {
        const args = command.args
            .filter((arg) => !arg.secondary)
            .map((arg) => `<${arg.name + (arg.optional ? '?' : '')}>`)
            .join(' ');
        const strLength = command.name.length + args.length;
        const spaceBetween = ''.padStart(24 - strLength);
        return `    ${chalk.bold(`${command.name}`)} ${args} ${spaceBetween} ${command.description}`;
    })
        .join('\n')}

  ${chalk.bold(`OPTIONS`)}

    ${chalk.bold(`-h, --help`)}                 Output usage information for a command
    ${chalk.bold(`-v, --version`)}              Output the version number
    ${chalk.bold(`-e, --env`)}                  Load env file given as parameter
    ${chalk.bold(`--verbose`)}                  Print additional logs
  `);
    process.exit(0);
};
const printCommandHelp = (command) => {
    console.log(`
  ${chalk.bold.cyan(`🧭  prisma4-multi-tenant} ${chalk.bold.yellow(`${command.name}`)}`)}

    ${command.description}

  ${chalk.bold(`USAGE`)}

    ${chalk.bold.italic(`prisma4-multi-tenant`)} ${command.name}${command.args.length > 0 ? ' ' : ''}${command.args
        .map((arg) => `${arg.secondary ? '<' : '['}${arg.name + (arg.optional ? '?' : '')}${arg.secondary ? '>' : ']'}`)
        .join(' ')}${command.options
        ? ' (' +
            command.options
                .map((option) => `--${option.name}` + (option.boolean ? '' : `=[${option.name}]`))
                .join(' ') +
            ')'
        : ''}
  `);
    if (command.args.length > 0) {
        console.log(`
  ${chalk.bold(`ARGS`)}

${command.args
            .map((arg) => {
            const argStr = arg.name.replace(/\|/g, ', ');
            const strLength = argStr.length;
            const spaceBetween = ''.padStart(15 - strLength);
            return `    ${chalk.bold(`${argStr}`)} ${spaceBetween} ${arg.description} ${arg.optional ? `${chalk.italic.grey(`(optional)`)}` : ''}`;
        })
            .join('\n')}
    `);
    }
    console.log(`\n  ${chalk.bold(`OPTIONS`)}`);
    if (command.options && command.options.length > 0) {
        console.log('\n' +
            command.options
                .map((option) => {
                const strLength = option.name.length;
                const spaceBetween = ''.padStart(13 - strLength);
                return `    ${chalk.bold(`--${option.name}`)} ${spaceBetween} ${option.description}`;
            })
                .join('\n'));
    }
    console.log(`
    ${chalk.bold(`-h, --help`)}       Display this help
    ${chalk.bold(`-e, --env`)}        Load env file given as parameter
    ${chalk.bold(`--verbose`)}        Print additional logs
  `);
};
const printGlobalVersion = () => {
    console.log(packageJson.version);
};
export default {
    printGlobalHelp,
    printCommandHelp,
    printGlobalVersion,
};
