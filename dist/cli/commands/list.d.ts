import { Management } from '../../index.js';
import { Command, CommandArguments } from '../types.js';
declare class List implements Command {
    name: string;
    args: any[];
    options: {
        name: string;
        description: string;
        boolean: boolean;
    }[];
    description: string;
    execute(args: CommandArguments, management: Management): Promise<void>;
}
declare const _default: List;
export default _default;
