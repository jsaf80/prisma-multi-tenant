import path from 'path'

import { envPaths } from '@prisma2-multi-tenant/shared'

export const loadEnv = (): void => {
  try {
    require('dotenv').config()

    for (const envPath of envPaths) {
      require('dotenv').config({
        path: path.resolve(process.cwd(), envPath),
      })
    }
  } catch {}
}
