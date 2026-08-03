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

  // 2. Normal Customer User
  const customer = await prisma.user.create({
    data: {
      full_name: 'Budi Santoso (Customer Demo)',
      email: 'customer@otova.com',
      phone_number: '081299998888',
      password_hash: passwordHash,
      role: 'user',
      address: 'Jl. Pemuda No. 12, Coblong, Bandung',
      latitude: -6.89148,
      longitude: 107.61049,
    },
  });

  // 3. Approved Partner User
  const partnerUser = await prisma.user.create({
    data: {
      full_name: 'Iwan Ganti Oli (Mitra Bengkel)',
      email: 'mitra@otova.com',
      phone_number: '081377778888',
      password_hash: passwordHash,
      role: 'mitra',
      address: 'Jl. Dago No. 100, Bandung',
      latitude: -6.8856,
      longitude: 107.6140,
    },
  });

  const partner = await prisma.partner.create({
    data: {
      user_id: partnerUser.id,
      partner_type: 'bengkel',
      business_name: 'Bengkel Cepat Dago',
      address: 'Jl. Dago No. 100, Bandung',
      latitude: -6.8856,
      longitude: 107.6140,
      verification_status: 'approved',
      is_online: true,
      services: JSON.stringify([
        { id: 's1', name: 'Ganti Oli Ringan', price: 45000, vehicle: 'motor' },
        { id: 's2', name: 'Service Rutin Bulanan', price: 90000, vehicle: 'motor' },
      ]),
      ktp_photo: '/uploads/ktp_default.jpg',
      business_photo: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=800&auto=format&fit=crop&q=80',
    },
  });

  // 4. Pending Partner User for Admin Verification Verification
  const pendingPartnerUser = await prisma.user.create({
    data: {
      full_name: 'Ahmad Montir (Mitra Pending)',
      email: 'mitra_pending@otova.com',
      phone_number: '081566665555',
      password_hash: passwordHash,
      role: 'user', // remains 'user' until approved by admin
      address: 'Jl. Dipati Ukur No. 50, Bandung',
      latitude: -6.8902,
      longitude: 107.6162,
    },
  });

  const pendingPartner = await prisma.partner.create({
    data: {
      user_id: pendingPartnerUser.id,
      partner_type: 'teknisi',
      business_name: 'Ahmad Montir Keliling',
      address: 'Jl. Dipati Ukur No. 50, Bandung',
      latitude: -6.8902,
      longitude: 107.6162,
      verification_status: 'pending',
      is_online: false,
      services: JSON.stringify([
        { id: 's3', name: 'Inspeksi Mesin Motor', price: 35000, vehicle: 'motor' },
      ]),
      ktp_photo: '/uploads/ktp_default.jpg',
      business_photo: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
    },
  });

  console.log('Seeding completed successfully!');
  console.log('--- DEMO ACCOUNTS READY TO USE ---');
  console.log('Admin: admin@otova.com (123456)');
  console.log('Customer: customer@otova.com (123456)');
  console.log('Mitra (Approved): mitra@otova.com (123456)');
  console.log('Mitra (Pending Verification): mitra_pending@otova.com (123456)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
