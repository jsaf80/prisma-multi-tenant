import { Project, initProject } from './helpers/project'

// If timeout error, increase the number
jest.setTimeout(1000000)

describe('dx', () => {
  let project: Project

  beforeAll(async () => {
    project = await initProject('cli-dx')

    await project.run('init --provider=sqlite --url=file:management.db')
    await project.run('new --name=test1 --url=file:db1.db')
    await project.run('new --name=test2 --url=file:db2.db')
  })

  test('env', async () => {
    const env1 = await project.run('env test1 -- printenv DATABASE_URL')
    const env2 = await project.run('env test2 -- printenv DATABASE_URL')

    expect(env1).toEqual(expect.stringContaining('file:db1.db'))
    expect(env2).toEqual(expect.stringContaining('file:db2.db'))
  })
})
