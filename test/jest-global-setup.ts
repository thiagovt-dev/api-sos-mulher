import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

function loadDotEnvTest() {
  const p = path.resolve(process.cwd(), '.env.test');
  if (fs.existsSync(p)) {
    const content = fs.readFileSync(p, 'utf-8');
    for (const line of content.split('\n')) {
      const m = line.match(/^\s*([^#=]+)\s*=\s*(.*)\s*$/);
      if (m) {
        const k = m[1].trim();
        let v = m[2].trim();
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
          v = v.slice(1, -1);
        }
        process.env[k] = v;
      }
    }
  }
}

module.exports = async () => {
  process.env.NODE_ENV = 'test';
  loadDotEnvTest();

  // Ensure LiveKit defaults for CI to avoid missing env errors
  if (!process.env.LIVEKIT_URL) process.env.LIVEKIT_URL = 'wss://test.local';
  if (!process.env.LIVEKIT_API_KEY) process.env.LIVEKIT_API_KEY = 'test_key';
  if (!process.env.LIVEKIT_API_SECRET) process.env.LIVEKIT_API_SECRET = 'test_secret';

  const { execSync } = await import('node:child_process');
  execSync('bunx prisma migrate deploy', { stdio: 'inherit' });

  const prisma = new PrismaClient();
  try {
    await prisma.$connect();

    // 🔧 Limpa em ordem segura (ou com CASCADE) para evitar FK error (Unit -> User)
    await prisma.$executeRawUnsafe(`
      TRUNCATE TABLE
        "Dispatch",
        "IncidentEvent",
        "Device",
        "Incident",
        "Unit",
        "User"
      RESTART IDENTITY CASCADE;
    `);
  } finally {
    await prisma.$disconnect();
  }
};
