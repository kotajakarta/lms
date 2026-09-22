import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const prisma = new PrismaClient();

async function createSuperadmin() {
  console.log('Connecting to database...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Configured' : 'NOT FOUND');

  const email = process.env.ADMIN_EMAIL || 'superadmin@lms.com';
  const passwordPlain = process.env.ADMIN_PASSWORD || 'admin123';
  const hashedPassword = await bcrypt.hash(passwordPlain, 10);

  // Check if superadmin already exists
  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    console.log(`User ${email} already exists. Updating password & role...`);
    const updated = await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        role: 'superadmin',
        two_factor_enabled: false,
      },
    });
    console.log('✅ Superadmin updated successfully:');
    console.log('   ID:', updated.id);
    console.log('   Email:', updated.email);
    console.log('   Role:', updated.role);
    console.log('   Password:', passwordPlain);
  } else {
    console.log(`Creating new superadmin ${email}...`);
    const created = await prisma.user.create({
      data: {
        nama: 'Super Administrator',
        email,
        password: hashedPassword,
        role: 'superadmin',
        two_factor_enabled: false,
      },
    });
    console.log('✅ Superadmin created successfully:');
    console.log('   ID:', created.id);
    console.log('   Email:', created.email);
    console.log('   Role:', created.role);
    console.log('   Password:', passwordPlain);
  }
}

createSuperadmin()
  .catch((err) => {
    console.error('❌ Error creating superadmin:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
