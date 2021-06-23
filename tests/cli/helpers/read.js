const { MultiTenant } = require('@prisma-multi-tenant/client')

const multiTenant = new MultiTenant()

const name = process.argv[2]

const main = async () => {
  const prisma = await multiTenant.get(name)

  const users = await prisma.user.findMany()

  if (users.length > 0) {
    console.log('Successfully read')
  } else {
    throw new Error('Unknown error during reading')
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await multiTenant.disconnect()
  })
