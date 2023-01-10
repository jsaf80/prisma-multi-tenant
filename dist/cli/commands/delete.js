import chalk from 'chalk';
import prompt from '../helpers/prompt.js';
class Delete {
    name = 'delete';
    altNames = ['remove'];
    args = [
        {
            name: 'name',
            description: 'Name of the tenant you want to delete',
        },
    ];
    options = [
        {
            name: 'schema',
            description: 'Specify path of schema',
        },
        {
            name: 'force',
            description: 'Delete the tenant without asking for confirmation',
            boolean: true,
        },
    ];
    description = 'Delete one tenant';
    async execute(args, management) {
        console.log();
        const [name] = args.args;
        if (!args.options.force &&
            !(await prompt.confirm(`${chalk.red(`Are you sure you want to delete the tenant "${name}"?`)}`))) {
            return;
        }
        await management.delete(name);
        console.log(`\n✅  ${chalk.green(`"${name}" has been deleted it from management!`)}\n`);
        console.log(`  ${chalk.yellow(`${chalk.bold(`Note:`)} You are still in charge of deleting the database!`)}\n`);
    }
}
export default new Delete();
