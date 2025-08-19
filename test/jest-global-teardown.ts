import { PrismaClient } from '@prisma/client';

module.exports = async () => {
  const prisma = new PrismaClient();
  try {
    await prisma.$disconnect();
  } catch {}
};
