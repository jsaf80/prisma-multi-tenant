import { setManagementEnv } from './env.js';
import { clientManagementPath } from './constants.js';
import { requireDistant } from './shell.js';
import { PmtError } from './errors.js';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/index.js';
export default class Management {
    options;
    client;
    constructor(options) {
        this.options = options;
    }
    async getClient() {
        if (this.client)
            return this.client;
        await setManagementEnv();
        let PrismaClient;
        if (this.options?.PrismaClient) {
            PrismaClient = this.options?.PrismaClient;
        }
        else {
            try {
                PrismaClient = requireDistant(clientManagementPath).PrismaClient;
            }
            catch {
                console.error(`\nError: Cannot find module '.prisma4-multi-tenant/management'.\n\nTry running "prisma4-multi-tenant generate"\n`);
                process.exit(1);
            }
        }
        this.client = new PrismaClient();
        return this.client;
    }
    async create(tenant) {
        const client = await this.getClient();
        try {
            return await client.tenant.create({
                data: tenant,
            });
        }
        catch (err) {
            if (err instanceof PrismaClientKnownRequestError && err.code == 'P2002')
                throw new PmtError('tenant-already-exists', tenant.name);
            throw err;
        }
    }
    async read(name) {
        const client = await this.getClient();
        const tenant = await client.tenant.findUnique({ where: { name } });
        if (!tenant) {
            throw new PmtError('tenant-does-not-exist', name);
        }
        return this.sanitizeTenant(tenant);
    }
    async exists(name) {
        const client = await this.getClient();
        const tenant = await client.tenant.findUnique({ where: { name } });
        return !!tenant;
    }
    async list() {
        const client = await this.getClient();
        const tenants = await client.tenant.findMany();
        return tenants.map(this.sanitizeTenant);
    }
    async update(name, update) {
        const client = await this.getClient();
        try {
            return await client.tenant.update({
                where: { name },
                data: update,
            });
        }
        catch (err) {
            if (err instanceof PrismaClientKnownRequestError && err.message.includes('RecordNotFound'))
                throw new PmtError('tenant-does-not-exist', name);
            throw err;
        }
    }
    async delete(name) {
        const client = await this.getClient();
        try {
            return await client.tenant.delete({ where: { name } });
        }
        catch (err) {
            if (err instanceof PrismaClientKnownRequestError && err.message.includes('RecordNotFound'))
                throw new PmtError('tenant-does-not-exist', name);
            throw err;
        }
    }
    disconnect() {
        if (!this.client)
            return Promise.resolve();
        return this.client.$disconnect();
    }
    sanitizeTenant(tenant) {
        const newTenant = {
            name: tenant.name,
            url: tenant.url,
        };
        return newTenant;
    }
}
