import { CommandArguments } from '../types.js';
declare const _default: {
    confirm: (message: string) => Promise<boolean>;
    managementConf: (args: CommandArguments) => Promise<{
        provider?: string;
        url: string;
    }>;
    tenantConf: (args: CommandArguments) => Promise<{
        name: string;
        url: string;
    }>;
};
export default _default;
