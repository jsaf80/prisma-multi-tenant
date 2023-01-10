import { initProject } from './helpers/project'
import { runShell } from './helpers/shell'
import path from 'path'

// If timeout error, increase the number
jest.setTimeout(500000)

describe('init', () => {
  test('init with url', async () => {
    const project = await initProject('cli-init-with-url')

    await project.run('init --provider=sqlite --url=file:management.db')

    await project.expectFile('prisma/management.db').toExists()
    await project.expectFile('multi-tenancy-example.js').toExists()
    await project
      .expectFile('multi-tenancy-example.js')
      .toContain("import { MultiTenant } from 'prisma4-multi-tenant'")
  })

  test('init without example file', async () => {
    const project = await initProject('cli-init-without-example')

    await project.run('init --provider=sqlite --url=file:management.db --no-example')

    await project.expectFile('prisma/management.db').toExists()
    await project.expectFile('multi-tenancy-example.js').toExists(false)
  })

  test('init with schema', async () => {
    const project = await initProject('cli-init-with-schema')
    const projectPath = path.join(__dirname, '../playground/', project.path)
    await runShell(
      "cp " + projectPath +
        "/prisma/schema.prisma " + projectPath + "/prisma/schema2.prisma", //prettier-ignore
    ); //prettier-ignore

    await project.run(
      "init --provider=sqlite --url=file:management.db --schema" + projectPath + "/prisma/schema2.prisma" //prettier-ignore
    )

    await project.expectFile('prisma/management.db').toExists()
    await project.expectFile('multi-tenancy-example.js').toExists()
  })
})
