import { findUp } from 'find-up';
import { exec, spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import chalk from 'chalk';
import { PmtError } from './errors.js';
import { clientManagementPath } from './constants.js';
import { getManagementEnv } from './env.js';
import * as console from 'console';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const __dirname = path.dirname(new URL(import.meta.url).pathname);
let nodeModulesPath;
export const runShell = (cmd, options) => {
    if (process.env.verbose == 'true') {
        console.log('  $> ' + cmd);
    }
    return new Promise((resolve, reject) => {
        exec(cmd, options, (error, stdout, stderr) => {
            if (process.env.verbose == 'true') {
                console.log(stderr || stdout);
            }
            if (error)
                reject(error);
            resolve(stdout);
        });
    });
};
export const spawnShell = (cmd) => {
    const [command, ...commandArguments] = cmd.split(' ');
    return new Promise((resolve) => spawn(command, commandArguments, {
        stdio: 'inherit',
        env: process.env,
        shell: true,
    }).on('exit', (exitCode) => resolve(exitCode)));
};
export const fileExists = async (path) => {
    try {
        await fs.promises.access(path, fs.constants.R_OK);
        return true;
    }
    catch (e) {
        return false;
    }
};
export const getNodeModules = async (cwd) => {
    if (nodeModulesPath)
        return nodeModulesPath;
    let currentPath = cwd || process.cwd();
    do {
        if (await fileExists(path.join(currentPath, 'node_modules'))) {
            nodeModulesPath = path.join(currentPath, 'node_modules');
        }
        else {
            if (currentPath != path.join(currentPath, '../')) {
                currentPath = path.join(currentPath, '../');
            }
            else {
                throw new PmtError('no-nodes-modules');
            }
        }
    } while (!nodeModulesPath);
    return nodeModulesPath;
};
export const getSharedPath = async () => {
    const sharedPath = await findUp('node_modules/prisma4-multi-tenant/dist/shared');
    return sharedPath != null ? sharedPath : __dirname;
};
export const runLocal = async (cmd, env) => {
    const sharedPath = await findUp('node_modules/prisma4-multi-tenant/dist/shared');
    return runShell(cmd, {
        cwd: sharedPath || '',
        env: {
            ...process.env,
            ...env,
        },
    });
};
export const runDistant = (cmd, tenant) => {
    return runShell(cmd, {
        cwd: process.cwd(),
        env: {
            ...process.env,
            DATABASE_URL: tenant?.url || process.env.DATABASE_URL || 'PMT_TMP_URL',
        },
    });
};
export const getPrismaCliPath = async () => {
    const path = await findUp('node_modules/prisma/build/index.js');
    if (!path) {
        throw new Error('Cannot find "prisma"');
    }
    return path;
};
export const isPrismaCliLocallyInstalled = async () => {
    return getPrismaCliPath()
        .then(() => true)
        .catch(() => false);
};
export const runLocalPrisma = async (cmd) => {
    const prismaCliPath = await getPrismaCliPath();
    const managementEnv = await getManagementEnv();
    const nodeModules = await getNodeModules();
    const PMT_OUTPUT = path.join(nodeModules, clientManagementPath);
    const schemaPath = path.join(__dirname, 'prisma/schema.prisma');
    return runLocal(`npx "${prismaCliPath}" ${cmd} --schema="${schemaPath}"`, {
        ...managementEnv,
        PMT_OUTPUT,
    });
};
export const runDistantPrisma = async (cmd, tenant, withTimeout = true) => {
    const prismaCliPath = await getPrismaCliPath();
    const promise = runDistant(`npx "${prismaCliPath}" ${cmd}`, tenant);
    if (!withTimeout) {
        return promise;
    }
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            const altCmd = (tenant?.name ? `prisma4-multi-tenant env ${tenant.name} -- ` : '') + 'npx prisma ' + cmd;
            if (chalk) {
                console.log(`\n  ${chalk.yellow(`Note: Prisma seems to be unresponsive. Try running \`${altCmd.trim()}\``)}\n`);
            }
            else {
                console.log(`Note: Prisma seems to be unresponsive. Try running \`${altCmd.trim()}\`}`);
            }
        }, 30 * 1000);
        promise
            .then((value) => {
            clearTimeout(timeout);
            resolve(value);
        })
            .catch((err) => {
            clearTimeout(timeout);
            reject(err);
        });
    });
};
export const requireDistant = (name) => {
    const previousEnv = { ...process.env };
    const required = require(require.resolve(name, {
        paths: [
            process.cwd() + '/node_modules/',
            process.cwd(),
            ...(require.main?.paths || []),
            __dirname + '/../../../',
        ],
    }));
    process.env = previousEnv;
    return required;
};
