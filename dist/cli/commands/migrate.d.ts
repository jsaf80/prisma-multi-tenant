/// <reference types="node" resolution-mode="require"/>
import { Datasource, Management } from '../../index.js';
import { Command, CommandArguments } from '../types.js';
declare class Migrate implements Command {
    name: string;
    args: {
        name: string;
        optional: boolean;
        description: string;
    }[];
    options: {
        name: string;
        description: string;
    }[];
    description: string;
    execute(args: CommandArguments, management: Management): Promise<void>;
    parseArgs(args: CommandArguments): {
        name: any;
        action: any;
        migrateArgs: any;
        prismaArgs: string;
    };
    migrateOneTenant(management: Management, action: string, name: string, schemaPath?: string, migrateArgs?: string, prismaArgs?: string): Promise<string | Buffer>;
    migrateAllTenants(management: Management, action: string, schemaPath?: string, migrateArgs?: string, prismaArgs?: string): Promise<Datasource[]>;
    migrateTenant(action: string, tenant?: Datasource, schemaPath?: string, migrateArgs?: string, prismaArgs?: string): Promise<string | Buffer>;
    migrateManagement(action: string, migrateArgs?: string, prismaArgs?: string): Promise<string | Buffer>;
    setupManagement(action: string, prismaArgs?: string): Promise<string | Buffer>;
    prepareDeploy(management: Management, name?: string, schemaPath?: string): Promise<number>;
    migrateSave(management: Management, name?: string, schemaPath?: string, migrateArgs?: string, prismaArgs?: string): Promise<number>;
}
declare const _default: Migrate;
export default _default;
