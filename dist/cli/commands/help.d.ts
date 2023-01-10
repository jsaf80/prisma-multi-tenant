import { Command } from '../types.js';
declare class Help implements Command {
    name: string;
    args: any[];
    description: string;
    execute(): Promise<void>;
}
declare const _default: Help;
export default _default;
