import path from "path"
import { getSharedPath, readSchemaFile, writeSchemaFile } from '@prisma2-multi-tenant/shared'

export const updateManagementSchemaFile = async (schemaPath?: string): Promise<boolean> => {
    console.log('\n  Updating management schema.prisma file...')

    const sharedPath = await getSharedPath()
    if (sharedPath == undefined)
      throw new Error('@prisma2-multi-tenant/shared not found')
    schemaPath = schemaPath || path.join(sharedPath, 'prisma/schema.prisma')
    
    if (schemaPath == undefined)
      throw new Error('Management schema not found')

    let managementProvider = process.env["MANAGEMENT_PROVIDER"] || undefined
    if (managementProvider == undefined)
      throw new Error('.env MANAGEMENT_PROVIDER not found')

    if (((managementProvider.startsWith('"') && managementProvider.endsWith('"'))) ||
        ((managementProvider.startsWith("'") && managementProvider.endsWith("'")))) {
      managementProvider = managementProvider.slice(1, -1)
    }
    
    // Read/write schema file and try to get first tenant's url
    try {
      let schemaFile = await readSchemaFile(schemaPath)

      const datasourceConfig = schemaFile.match(/datasource\s*\w*\s*\{\s([^}]*)\}/)?.[1]
      if (!datasourceConfig) {
        throw new Error('No config found in schema.prisma')
      }

      const datasourceConfigProvider = datasourceConfig
        .split('\n')
        .map((l) =>
          l
            .trim()
            .split('=')
            .map((l) => l.trim())
        )
        .find(([key]) => key === 'provider')?.[1]
      if (!datasourceConfigProvider) {
        throw new Error('No provider found in datasource')
      }

      schemaFile = schemaFile.replace(datasourceConfigProvider, JSON.stringify(managementProvider))
      await writeSchemaFile(schemaFile, schemaPath)
    } catch { return false}

    return true
  }