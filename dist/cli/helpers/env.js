import path from 'path';
import { envPaths } from '../../shared/env.js';
import * as dotenv from 'dotenv';
dotenv.config();
export const loadEnv = () => {
    try {
        dotenv.config();
        for (const envPath of envPaths) {
            dotenv.config({
                path: path.resolve(process.cwd(), envPath),
            });
        }
    }
    catch (e) {
        console.log(e);
    }
};
