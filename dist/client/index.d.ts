import { Management, Datasource } from '../index.js';
interface MultiTenantOptions {
    useManagement?: boolean;
    tenantOptions?: any;
    PrismaClient?: any;
    PrismaClientManagement?: any;
}
interface WithMeta {
    _meta: {
        name: string;
    };
}
interface Tenant {
    name: string;
    url: string;
}
declare class MultiTenant<PrismaClient extends {
    $disconnect: () => Promise<void>;
}> {
    ClientTenant: any;
    management?: Management;
    tenants: {
        [name: string]: PrismaClient & WithMeta;
    };
    options: MultiTenantOptions;
    constructor(options?: MultiTenantOptions);
    private loadEnv;
    private requireTenant;
    private isCliAvailable;
    get(name: string, options?: any): Promise<PrismaClient & WithMeta>;
    directGet(tenant: {
        name: string;
        url: string;
    }, options?: any): Promise<PrismaClient & WithMeta>;
    createTenant(tenant: Tenant, options?: any): Promise<PrismaClient & WithMeta>;
    listTenants(): Promise<string[]>;
    migrateTenants(): Promise<Datasource[]>;
    deleteTenant(name: string): Promise<Tenant>;
    existsTenant(name: string): Promise<boolean>;
    disconnect(): Promise<void[]>;
}
export { MultiTenant };
