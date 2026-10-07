import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Create a sample user
  const user = await prisma.user.upsert({
    where: { email: 'dev@example.com' },
    update: {},
    create: {
      email: 'dev@example.com',
      auth0Subject: 'auth0|dev1234567890',
      fullName: 'Dev User',
      projects: {
        create: [
          {
            name: 'Project Alpha',
            description: 'First test project',
            status: 'IN_PROGRESS',
            tasks: {
              create: [
                {
                  name: 'Task 1',
                  description: 'Do something',
                  priority: 'HIGH',
                  status: 'PENDING',
                },
                {
                  name: 'Task 2',
                  description: 'Do something else',
                  priority: 'MEDIUM',
                  status: 'IN_PROGRESS',
                },
              ],
            },
          },
          {
            name: 'Project Beta',
            description: 'Second test project',
            status: 'NOT_STARTED',
          },
        ],
      },
    },
  });

  console.log(`Created user with id: ${user.id}`);
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
