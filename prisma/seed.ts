import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning database...');
  await prisma.notification.deleteMany();
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.order.deleteMany();
  await prisma.partner.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding users...');
  const passwordHash = await bcrypt.hash('123456', 10);

  // 1. Admin User (Required for central system admin)
  const admin = await prisma.user.create({
    data: {
      full_name: 'Admin Otova Central',
      email: 'admin@otova.com',
      phone_number: '081234567890',
      password_hash: passwordHash,
      role: 'admin',
      address: 'Jl. Utama Otova No. 1, Jakarta',
    },
  });

  console.log('Seeding completed successfully (Clean State, Admin Only)!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
