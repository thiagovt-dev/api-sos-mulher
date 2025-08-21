import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const unit = await prisma.unit.upsert({
    where: { plate: 'GCM-01' },
    update: {},
    create: { name: 'GCM 01', plate: 'GCM-01', fcmToken: 'TESTE_PUSH' },
  });
  console.log('Seeded unit:', unit);
}
main().finally(() => prisma.$disconnect());
