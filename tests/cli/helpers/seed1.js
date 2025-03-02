import { MultiTenant } from 'prisma4-multi-tenant'

const multiTenant = new MultiTenant()

const name = process.argv[2]

const main = async () => {
  const prisma = await multiTenant.get(name)

  const userSeeded = await prisma.user.create({
    data: {
      name: 'Jane',
      surname: 'Doe',
      email: Math.random() + '@jane.doe',
    },
  })
  const user = await prisma.user.findUnique({
    where: { id: userSeeded.id },
  })

  if (user.name == 'Jane' && user.email.endsWith('@jane.doe')) {
    console.log('Successfully seeded')
  } else {
    throw new Error('Unknown error during seeding')
  }
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await multiTenant.disconnect()
  })
