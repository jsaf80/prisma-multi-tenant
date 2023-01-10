import * as path from 'path';
import * as fs from 'fs';
import { Management, runDistantPrisma, requireDistant } from '../index.js';
const defaultMultiTenantOptions = {
    useManagement: true,
};
class MultiTenant {
    ClientTenant;
    management;
    tenants;
    options;
    constructor(options) {
        this.options = { ...defaultMultiTenantOptions, ...options };
        this.loadEnv();
        this.ClientTenant = this.requireTenant();
        if (this.options.useManagement) {
            this.management = new Management({ PrismaClient: this.options.PrismaClientManagement });
        }
        this.tenants = {};
    }
    loadEnv() {
        try {
            const envFile = fs.readFileSync(path.join(process.cwd(), 'prisma/.env'), 'utf-8');
            const envVars = envFile
                .split(/\n/g)
                .map((l) => l.trim())
                .filter((l) => !(l == '' || l.startsWith('#')))
                .map((l) => l
                .split('=')
                .map((s) => s.trim())
                .slice(0, 2));
            envVars.forEach(([key, val]) => {
                if (!process.env[key]) {
                    process.env[key] = val;
                }
            });
        }
        catch {
        }
    }
    requireTenant() {
        if (this.options.PrismaClient) {
            return this.options.PrismaClient;
        }
        return requireDistant(`@prisma/client`).PrismaClient;
    }
    isCliAvailable(method) {
        try {
            require('prisma');
        }
        catch {
            if (!process.env.PMT_TEST) {
                throw new Error(`"prisma" needs to be installed in order to use this MultiTenant.${method}(), but it doesn't seem to be present. Did you forget to install it?`);
            }
        }
        return true;
    }
    async get(name, options) {
        if (this.tenants[name])
            return this.tenants[name];
        if (!this.management) {
            throw new Error('Cannot use .get(name) on an unknown tenant with `useManagement: false`');
        }
        const tenant = await this.management.read(name);
        if (!tenant) {
            throw new Error(`The tenant with the name "${name}" does not exist`);
        }
        return this.directGet(tenant, options);
    }
    async directGet(tenant, options) {
        process.env.DATABASE_URL = tenant.url;
        const client = new this.ClientTenant({ ...this.options.tenantOptions, ...options });
        client._meta = {
            name: tenant.name,
        };
        this.tenants[tenant.name] = client;
        return client;
    }
    async createTenant(tenant, options) {
        if (!this.management) {
            throw new Error('Cannot use .createTenant(tenant, options) with `useManagement: false`');
        }
        if (tenant.name == 'management') {
            throw new Error('The name "management" is reserved. You cannot use it for a tenant.');
        }
        this.isCliAvailable('createTenant');
        await this.management.create(tenant);
        await runDistantPrisma('migrate deploy ', tenant, false);
        return this.directGet(tenant, options);
    }
    async listTenants() {
        if (!this.management) {
            throw new Error('Cannot use .listTenants() with `useManagement: false`');
        }
        return this.management
            .list()
            .then((tenants) => tenants.map((tenant) => tenant.name));
    }
    async migrateTenants() {
        if (!this.management) {
            throw new Error('Cannot use .migrateTenants() with `useManagement: false`');
        }
        try {
            this.isCliAvailable('migrateTenants');
            const tenants = await this.management.list();
            for await (const tenant of tenants) {
                await runDistantPrisma('migrate deploy ', tenant, false);
            }
            return tenants;
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }
    async deleteTenant(name) {
        if (!this.management) {
            throw new Error('Cannot use .deleteTenant(name) with `useManagement: false`');
        }
        this.isCliAvailable('deleteTenant');
        if (this.tenants[name]) {
            delete this.tenants[name];
        }
        const tenant = await this.management.delete(name);
        return tenant;
    }
    async existsTenant(name) {
        if (!this.management) {
            throw new Error('Cannot use .existsTenant(name) with `useManagement: false`');
        }
        if (this.tenants[name])
            return true;
        return this.management.exists(name);
    }
    disconnect() {
        return Promise.all([
            ...(this.management ? [this.management.disconnect()] : []),
            ...Object.values(this.tenants).map((t) => t.$disconnect()),
        ]);
    }
}
export { MultiTenant };
