import { runDistantPrisma, getSchemaPath } from '../../index.js';
import chalk from 'chalk';
class Studio {
    name = 'studio';
    args = [
        {
            name: 'name',
            optional: false,
            description: 'Name of the tenant you want to access',
        },
    ];
    options = [
        {
            name: 'port',
            altNames: ['p'],
            description: 'Port to start Studio on',
        },
        {
            name: 'schema',
            description: 'Specify path of schema',
        },
    ];
    description = 'Use Studio to access a tenant';
    async execute(args, management) {
        const [name] = args.args;
        const port = args.options.port || '5555';
        console.log(`\n  Studio started for tenant "${name}" at http://localhost:${port}\n`);
        const tenant = await management.read(name);
        try {
            const schemaPath = args.options.schema || (await getSchemaPath());
            await runDistantPrisma(`studio --port ${port} --schema ${schemaPath} ${args.secondary}`, tenant, false);
        }
        catch (err) {
            if (err.message.includes('EADDRINUSE') || err.code === '7') {
                console.log(chalk.red(`  The port for studio is already being used, try another one:`));
                console.log(`  > prisma4-multi-tenant studio ${name} --port ${Number(port) + 1}\n`);
            }
            else {
                throw err;
            }
        }
    }
}
export default new Studio();
