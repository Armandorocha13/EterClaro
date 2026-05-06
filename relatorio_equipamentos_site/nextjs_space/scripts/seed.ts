import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Seed admin user
  const adminPassword = await bcrypt.hash('Admin@3540', 10);
  await prisma.user.upsert({
    where: { email: 'thiagosouza@ffainfraestrutura.com.br' },
    update: {},
    create: {
      email: 'thiagosouza@ffainfraestrutura.com.br',
      password: adminPassword,
      name: 'Thiago Souza',
      role: 'admin',
    },
  });
  console.log('Admin user seeded');

  // Seed test user
  const testPassword = await bcrypt.hash('johndoe123', 10);
  await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: {
      email: 'john@doe.com',
      password: testPassword,
      name: 'Test User',
      role: 'admin',
    },
  });
  console.log('Test user seeded');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
