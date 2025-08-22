import { PrismaClient, Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function upsertPoliceUnit(params: { username: string; name: string; plate?: string; fcmToken?: string; pin?: string }) {
  const { username, name, plate, fcmToken, pin = '123456' } = params;
  const passwordHash = await bcrypt.hash(pin, 10);
  const user = await prisma.user.upsert({
    where: { username },
    update: {},
    create: { username, passwordHash, roles: { set: ['POLICE'] } },
  });
  const unit = await prisma.unit.upsert({
    where: { id: user.id },
    update: { name, plate, fcmToken },
    create: { id: user.id, name, plate, fcmToken },
  });
  return { user, unit, pin };
}

async function upsertAdmin(params: { username: string; password?: string; email?: string }) {
  const { username, password = 'admin123', email } = params;
  const passwordHash = await bcrypt.hash(password, 10);
  const admin = await prisma.user.upsert({
    where: { username },
    update: {},
    create: { username, email, passwordHash, roles: { set: ['ADMIN'] } },
  });
  return { admin, password };
}

async function upsertCitizen(params: {
  username: string;
  password?: string;
  email?: string;
  phone: string;
  address?: Partial<{
    street: string; number: string; district: string; city: string; state: string; zip: string;
  }>;
}) {
  const { username, password = '123456', email, phone, address = {} } = params;
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.upsert({
    where: { username },
    update: {},
    create: { username, email, passwordHash, roles: { set: ['CITIZEN'] } },
  });
  const profile = await prisma.citizenProfile.upsert({
    where: { userId: user.id },
    update: { phone, ...address },
    create: { userId: user.id, phone, ...address },
  });
  return { user, profile, password };
}

async function upsertIncident(params: {
  code: string;
  description?: string;
  lat: string;
  lng: string;
  address?: string;
  status?: 'OPEN' | 'IN_DISPATCH' | 'RESOLVED' | 'CANCELED';
}) {
  const { code, description, lat, lng, address, status = 'OPEN' } = params;
  const incident = await prisma.incident.upsert({
    where: { code },
    update: { description, lat: new Prisma.Decimal(lat), lng: new Prisma.Decimal(lng), address, status },
    create: { code, description, lat: new Prisma.Decimal(lat), lng: new Prisma.Decimal(lng), address, status },
  });
  return incident;
}

async function upsertDispatch(params: {
  id: string; // provide deterministic id for idempotency
  incidentId: string;
  unitId: string;
  status?: 'PENDING' | 'NOTIFIED' | 'ACCEPTED' | 'REJECTED' | 'CANCELED';
  notifiedAt?: Date | null;
  acceptedAt?: Date | null;
}) {
  const { id, incidentId, unitId, status = 'PENDING', notifiedAt, acceptedAt } = params;
  const dispatch = await prisma.dispatch.upsert({
    where: { id },
    update: { incidentId, unitId, status, notifiedAt, acceptedAt },
    create: { id, incidentId, unitId, status, notifiedAt, acceptedAt },
  });
  return dispatch;
}

async function upsertDevice(params: {
  token: string;
  platform: 'ANDROID' | 'IOS' | 'WEB';
  userId?: string | null;
  unitId?: string | null;
  deviceId?: string | null;
  appVersion?: string | null;
}) {
  const { token, platform, userId = null, unitId = null, deviceId, appVersion } = params;
  const device = await prisma.device.upsert({
    where: { token },
    update: { platform, userId, unitId, deviceId, appVersion, active: true },
    create: { token, platform, userId, unitId, deviceId, appVersion },
  });
  return device;
}

async function main() {
  // Always ensure an admin exists (helpful in any env)
  const { admin, password: adminPass } = await upsertAdmin({ username: 'admin', email: 'admin@example.com' });
  console.log('Seeded ADMIN user:', { username: 'admin', password: adminPass, userId: admin.id });

  // Base POLICE unit always present
  const gcm01 = await upsertPoliceUnit({ username: 'gcm01', name: 'GCM 01', plate: 'GCM-01', fcmToken: 'TESTE_PUSH', pin: '123456' });
  console.log('Seeded POLICE unit:', { username: 'gcm01', pin: gcm01.pin, userId: gcm01.user.id, unitId: gcm01.unit.id });

  if (process.env.NODE_ENV !== 'development') {
    console.log('NODE_ENV is not development; skipping full dataset.');
    return;
  }

  // Additional POLICE units for development
  const gcm02 = await upsertPoliceUnit({ username: 'gcm02', name: 'GCM 02', plate: 'GCM-02', pin: '123456' });
  const gcm03 = await upsertPoliceUnit({ username: 'gcm03', name: 'GCM 03', plate: 'GCM-03', pin: '123456' });
  console.log('Seeded extra POLICE units:', [gcm02.unit.plate, gcm03.unit.plate]);

  // Citizens
  const maria = await upsertCitizen({
    username: 'maria',
    email: 'maria@example.com',
    phone: '+55 11 99999-0001',
    address: { city: 'São Paulo', state: 'SP', street: 'Rua A', number: '100', district: 'Centro', zip: '01000-000' },
  });
  const joana = await upsertCitizen({
    username: 'joana',
    email: 'joana@example.com',
    phone: '+55 11 99999-0002',
    address: { city: 'São Paulo', state: 'SP', street: 'Rua B', number: '200', district: 'Bela Vista', zip: '01310-000' },
  });
  console.log('Seeded CITIZEN users:', ['maria', 'joana']);

  // Incidents
  const inc1 = await upsertIncident({ code: 'INC-001', description: 'Vítima solicita ajuda', lat: '-23.550520', lng: '-46.633308', address: 'Av. Paulista, 1000', status: 'IN_DISPATCH' });
  const inc2 = await upsertIncident({ code: 'INC-002', description: 'Ameaça nas proximidades', lat: '-23.562880', lng: '-46.654320', address: 'Rua da Consolação, 500', status: 'OPEN' });

  // Dispatches for incidents (deterministic IDs for idempotency)
  await upsertDispatch({ id: '00000000-0000-0000-0000-000000000d01', incidentId: inc1.id, unitId: gcm01.unit.id, status: 'NOTIFIED', notifiedAt: new Date() });
  await upsertDispatch({ id: '00000000-0000-0000-0000-000000000d02', incidentId: inc2.id, unitId: gcm02.unit.id, status: 'PENDING' });

  // Devices
  await upsertDevice({ token: 'device-token-gcm01', platform: 'ANDROID', unitId: gcm01.unit.id, deviceId: 'gcm01-android', appVersion: '1.0.0' });
  await upsertDevice({ token: 'device-token-gcm02', platform: 'ANDROID', unitId: gcm02.unit.id, deviceId: 'gcm02-android', appVersion: '1.0.0' });
  await upsertDevice({ token: 'device-token-maria', platform: 'ANDROID', userId: maria.user.id, deviceId: 'maria-android', appVersion: '1.0.0' });
  await upsertDevice({ token: 'device-token-joana', platform: 'ANDROID', userId: joana.user.id, deviceId: 'joana-android', appVersion: '1.0.0' });
}

main().finally(() => prisma.$disconnect());
