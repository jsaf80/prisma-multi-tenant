/// <reference types="node" resolution-mode="require"/>
import { Datasource } from './types.js';
export declare const runShell: (cmd: string, options?: {
    cwd: string;
    env?: {
        [name: string]: string;
    };
}) => Promise<string | Buffer>;
export declare const spawnShell: (cmd: string) => Promise<number>;
export declare const fileExists: (path: string) => Promise<boolean | string>;
export declare const getNodeModules: (cwd?: string) => Promise<string>;
export declare const getSharedPath: () => Promise<string | undefined>;
export declare const runLocal: (cmd: string, env?: {
    [name: string]: string;
}) => Promise<string | Buffer>;
export declare const runDistant: (cmd: string, tenant?: Datasource) => Promise<string | Buffer>;
export declare const getPrismaCliPath: () => Promise<string>;
export declare const isPrismaCliLocallyInstalled: () => Promise<boolean>;
export declare const runLocalPrisma: (cmd: string) => Promise<string | Buffer>;
export declare const runDistantPrisma: (cmd: string, tenant?: Datasource, withTimeout?: boolean) => Promise<string | Buffer>;
export declare const requireDistant: (name: string) => any;
