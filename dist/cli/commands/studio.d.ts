import { Management } from '../../index.js';
import { Command, CommandArguments } from '../types.js';
declare class Studio implements Command {
    name: string;
    args: {
        name: string;
        optional: boolean;
        description: string;
    }[];
    options: ({
        name: string;
        altNames: string[];
        description: string;
    } | {
        name: string;
        description: string;
        altNames?: undefined;
    })[];
    description: string;
    execute(args: CommandArguments, management: Management): Promise<void>;
}
declare const _default: Studio;
export default _default;
