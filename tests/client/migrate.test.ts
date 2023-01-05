// @ts-ignore
const { MultiTenant } = require('@prisma4-multi-tenant/client');
// @ts-ignore
const { fileExists } = require('../../../cli/helpers/shell');

describe('migrate', () => {
  test('create', async () => {
    const multiTenant = new MultiTenant();

    const tenant1 = await multiTenant.createTenant({
      name: 'test-migrate-1',
      url: 'file:test-migrate-1.db',
    });

    expect(tenant1).toBeDefined();
    expect(tenant1._meta).toStrictEqual({ name: 'test-migrate-1' });
    expect(tenant1).toBeInstanceOf(multiTenant.ClientTenant);
    expect(multiTenant.tenants['test-migrate-1']).toBe(tenant1);
    await expect(fileExists('test-client/prisma/test-migrate-1.db'))
      .resolves.toBe(true)
      .then(() => multiTenant.disconnect());

    const tenant2 = await multiTenant.createTenant({
      name: 'test-migrate-2',
      url: 'file:test-migrate-2.db',
    });

    expect(tenant2).toBeDefined();
    expect(tenant2._meta).toStrictEqual({ name: 'test-migrate-2' });
    expect(tenant2).toBeInstanceOf(multiTenant.ClientTenant);
    expect(multiTenant.tenants['test-migrate-2']).toBe(tenant2);
    await expect(fileExists('test-client/prisma/test-migrate-2.db'))
      .resolves.toBe(true)
      .then(() => multiTenant.disconnect());
  });

  test('migrate', async () => {
    const multiTenant = new MultiTenant();

    const fse = require('fs-extra');

    const srcDir = `prisma/20220601191414_second`;
    const destDir = `prisma/migrations/20220601191414_second`;

    fse.copySync(
      srcDir,
      destDir,
      {
        overwrite: true,
      },
      (err: any) => {
        if (err) {
          console.error(err);
        } else {
          console.log('success!');
        }
      },
    );

    await expect(await multiTenant.migrateTenants()).toEqual(
      expect.arrayContaining([
        { name: 'dev', url: 'file:dev.db' },
        { name: 'test1', url: 'file:dev1.db' },
        { name: 'test-create-1', url: 'file:test-create-1.db' },
        { name: 'test-migrate-1', url: 'file:test-migrate-1.db' },
        { name: 'test-exists-1', url: 'file:test-exists-1.db' },
        { name: 'test-migrate-2', url: 'file:test-migrate-2.db' },
      ]),
    );
    multiTenant.disconnect();
  });
});

