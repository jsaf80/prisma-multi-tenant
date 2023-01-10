import Management from '../../shared/management.js';
import { Command, CommandArguments } from '../types.js';
declare class Delete implements Command {
    name: string;
    altNames: string[];
    args: {
        name: string;
        description: string;
    }[];
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
    execute(args: CommandArguments, management: Management): Promise<void>;
}
declare const _default: Delete;
export default _default;
