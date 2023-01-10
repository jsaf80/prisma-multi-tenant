import { Command, CommandArguments } from '../types.js';
declare class Generate implements Command {
    name: string;
    args: any[];
    options: ({
        name: string;
        description: string;
        boolean?: undefined;
    } | {
        name: string;
        description: string;
        boolean: boolean;
    })[];
    description: string;
    execute(args: CommandArguments): Promise<void>;
    generateTenants(schemaPath?: string, prismaArgs?: string): Promise<void>;
    generateManagement(): Promise<void>;
    watchGenerateTenants(schemaPath?: string, prismaArgs?: string): Promise<void>;
}
declare const _default: Generate;
export default _default;
