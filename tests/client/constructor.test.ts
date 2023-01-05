// @ts-ignore
const { MultiTenant } = require('@prisma4-multi-tenant/client');

describe('constructor', () => {
  test('no options', () => {
    const multiTenant = new MultiTenant();

    expect(multiTenant.management).toBeDefined();
  });

  test('use-management: true', () => {
    const multiTenant = new MultiTenant({
      useManagement: true,
    });

    expect(multiTenant.management).toBeDefined();
  });

  test('use-management: false', () => {
    const multiTenant = new MultiTenant({
      useManagement: false,
    });

    expect(multiTenant.management).toBeUndefined();
  });

  test('PrismaClient & PrismaClientManagement', () => {
    const PrismaClient = require(`@prisma/client`);
    const PrismaClientManagement = require(`.prisma4-multi-tenant/management`);

    const multiTenant = new MultiTenant({
      PrismaClient,
      PrismaClientManagement,
    });

    expect(multiTenant.ClientTenant).toBe(PrismaClient);
    //multiTenant.disconnect();
    // We can't test for PrismaClientManagement
  });
});

