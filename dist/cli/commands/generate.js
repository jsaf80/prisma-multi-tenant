import chalk from 'chalk';
import { runDistantPrisma, runLocalPrisma, spawnShell, getSchemaPath } from '../../index.js';
import { updateManagementSchemaFile } from '../helpers/schema.js';
class Generate {
    name = 'generate';
    args = [];
    options = [
        {
            name: 'schema',
            description: 'Specify path of schema',
        },
        {
            name: 'watch',
            description: 'Watches the Prisma project file',
            boolean: true,
        },
    ];
    description = 'Generate Prisma Clients for the tenants and management';
    async execute(args) {
        if (!args.options.watch) {
            console.log('\n  Generating Prisma Clients for both management and tenants...');
            await this.generateTenants(args.options.schema, args.secondary);
            await this.generateManagement();
            console.log(chalk.green(`\n✅  { Prisma Clients have been generated!}\n`));
        }
        else {
            console.log('\n  Generating Prisma Client for management');
            await this.generateManagement();
            console.log(chalk.green(`\n✅  { Prisma Client for management has been generated!}\n`));
            console.log('\n  Generating and watching Prisma Client for tenants');
            await this.watchGenerateTenants(args.options.schema, args.secondary);
        }
    }
    async generateTenants(schemaPath, prismaArgs) {
        schemaPath = schemaPath || (await getSchemaPath());
        await runDistantPrisma(`generate --schema ${schemaPath} ${prismaArgs || ''}`);
    }
    async generateManagement() {
        await updateManagementSchemaFile();
        await runLocalPrisma('generate');
    }
    async watchGenerateTenants(schemaPath, prismaArgs) {
        schemaPath = schemaPath || (await getSchemaPath());
        spawnShell(`npx prisma generate --schema ${schemaPath} --watch ${prismaArgs || ''}`).then((exitCode) => process.exit(exitCode));
    }
}
export default new Generate();
