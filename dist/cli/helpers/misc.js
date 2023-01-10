import path from 'path';
import { fileExists } from '../../index.js';
export const useYarn = async () => {
    if (await fileExists(path.join(process.cwd(), 'yarn.lock'))) {
        return true;
    }
    if (await fileExists(path.join(process.cwd(), '../yarn.lock'))) {
        return true;
    }
    return false;
};
