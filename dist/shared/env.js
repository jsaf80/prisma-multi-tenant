import * as path from 'path';
import * as fs from 'fs';
import { PmtError } from './errors.js';
import { fileExists } from './shell.js';
export const translateDatasourceUrl = (url, cwd) => {
    if (url.startsWith('"') && url.endsWith('"')) {
        url = url.slice(1, -1);
    }
    if (url.startsWith('file:') && !url.startsWith('file:/')) {
        return 'file:' + path.join(cwd || process.cwd(), url.replace('file:', '')).replace(/\\/g, '/');
    }
    return url;
};
export const getManagementEnv = async () => {
    if (!process.env.MANAGEMENT_PROVIDER) {
        throw new PmtError('missing-env', { name: 'MANAGEMENT_PROVIDER' });
    }
    if (!process.env.MANAGEMENT_URL) {
        throw new PmtError('missing-env', { name: 'MANAGEMENT_URL' });
    }
    const managementProvider = process.env.MANAGEMENT_PROVIDER;
    const managementUrl = translateDatasourceUrl(process.env.MANAGEMENT_URL);
    return {
        PMT_MANAGEMENT_PROVIDER: managementProvider,
        PMT_MANAGEMENT_URL: managementUrl,
        PMT_OUTPUT: 'PMT_TMP',
    };
};
export const setManagementEnv = async () => {
    const managementEnv = await getManagementEnv();
    Object.entries(managementEnv).forEach(([key, value]) => (process.env[key] = value));
};
export const envPaths = [
    'prisma/.env',
    'db/.env',
    '../.env.defaults',
    '.env',
];
export const getEnvPath = async (schemaPath) => {
    if (schemaPath) {
        const envPath = path.join(path.dirname(schemaPath), '.env');
        if (await fileExists(envPath)) {
            return envPath;
        }
    }
    for await (const envPath of envPaths) {
        if (await fileExists(envPath)) {
            return envPath;
        }
    }
    throw new Error("Couldn't find the prisma/.env file");
};
export const readEnvFile = async (schemaPath) => {
    const path = await getEnvPath(schemaPath);
    return fs.promises.readFile(path, 'utf-8');
};
export const writeEnvFile = async (content, schemaPath) => {
    let path;
    try {
        path = await getEnvPath(schemaPath);
    }
    catch {
        path = 'prisma/.env';
    }
    return fs.promises.writeFile(path, content);
};
export const schemaPaths = [
    'prisma/schema.prisma',
    'db/schema.prisma',
    'api/prisma/schema.prisma',
    'schema.prisma',
];
export const getSchemaPath = async () => {
    for await (const schemaPath of schemaPaths) {
        if (await fileExists(schemaPath)) {
            return schemaPath;
        }
    }
    throw new Error("Couldn't find the schema file");
};
export const readSchemaFile = async (schemaPath) => {
    const path = schemaPath || (await getSchemaPath());
    return fs.promises.readFile(path, 'utf-8');
};
export const writeSchemaFile = async (content, schemaPath) => {
    const path = schemaPath || (await getSchemaPath());
    return fs.promises.writeFile(path, content, 'utf-8');
};
