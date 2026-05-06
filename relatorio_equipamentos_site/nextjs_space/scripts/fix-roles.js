const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Atualizando roles dos usuários...');
  
  // Primeiro, define todos como 'user'
  await prisma.user.updateMany({
    data: { role: 'user' }
  });
  
  // Depois, define o admin específico
  const adminEmail = 'thiagosouza@ffainfraestrutura.com.br';
  await prisma.user.update({
    where: { email: adminEmail },
    data: { role: 'admin' }
  });
  
  console.log('Roles atualizadas com sucesso!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
