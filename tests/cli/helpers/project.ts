import { runShell, fileExists, spawnCommand } from './shell'
export interface Project {
  path: string
  name: string
}

export class Project {
  constructor({ name, path }: { name: string; path: string }) {
    this.name = name
    this.path = path
    if (process.env.SILENT_TEST === 'true') {
      console.log = function () {}
    }
  }
  async run(cmd: string) {
    console.log(`Running "prisma4-multi-tenant ${cmd}" on "${this.name}"`)

    return runShell("prisma4-multi-tenant " + cmd, this.path); //prettier-ignore
  }

  exec(cmd: string) {
    console.log(`Running "prisma4-multi-tenant ${cmd}" on "${this.name}"`)

    return spawnCommand('prisma4-multi-tenant ' + cmd, this.path)
  }

  expect() {
    return {
      toSeed: async (tenant: string, expected: boolean = true, seedFile: string = './seed.js') => {
        const results = await runShell(
          `npx dotenv -e prisma/.env -- node ${seedFile} ${tenant}`,
          this.path
        ).catch((e) => e)
        if (expected) {
          expect(results).toEqual(expect.stringContaining('Successfully seeded'))
        } else {
          expect(results).not.toEqual(expect.stringContaining('Successfully seeded'))
        }
      },
      toRead: async (tenant: string, expected: boolean = true, readFile: string = './read.js') => {
        const results = await runShell(
          `npx dotenv -e prisma/.env -- node ${readFile} ${tenant}`,
          this.path
        ).catch((e) => e)
        if (expected) {
          expect(results).toEqual(expect.stringContaining('Successfully read'))
        } else {
          expect(results).not.toEqual(expect.stringContaining('Successfully read'))
        }
      },
    }
  }

  expectFile(path: string) {
    return {
      toExists: async (expected: boolean = true) => {
        const exists = await fileExists(this.path + '/' + path)
        expect(exists).toBe(expected)
      },
      toContain: async (expected: string) => {
        const content = await runShell(`cat ${path}`, this.path)
        expect(content).toEqual(expect.stringContaining(expected))
      },
    }
  }
}

export const initProject = async (name: string): Promise<Project> => {
  if (process.env.SILENT_TEST === 'true') {
    console.log = function () {}
  }
  console.log(`Initializing ${name} project...`)

  if (await fileExists('test-' + name)) {
    //prettier-ignore
    await runShell("rm -rf test-" + name); //prettier-ignore
  }
  await runShell("cp -rf example test-" + name); //prettier-ignore
  await runShell("cd test-" + name); //prettier-ignore
  //await runShell("npm install"); //prettier-ignore

  return new Project({ name, path: 'test-' + name })
}
