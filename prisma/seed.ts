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

  // 1. Admin User
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

  // 2. Regular Users
  const user1 = await prisma.user.create({
    data: {
      full_name: 'Budi Santoso',
      email: 'budi@gmail.com',
      phone_number: '081299887766',
      password_hash: passwordHash,
      role: 'user',
      address: 'Jl. Pemuda No. 12, Bandung',
      latitude: -6.917464,
      longitude: 107.619123,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      full_name: 'Siti Rahmawati',
      email: 'siti@gmail.com',
      phone_number: '085711223344',
      password_hash: passwordHash,
      role: 'user',
      address: 'Jl. Merdeka No. 45, Bandung',
      latitude: -6.90389,
      longitude: 107.61861,
    },
  });

  // 3. Partner Users & Partners
  // Partner 1: Bengkel Approved
  const partnerUser1 = await prisma.user.create({
    data: {
      full_name: 'Hendra Bengkel',
      email: 'majumotor@gmail.com',
      phone_number: '081344556677',
      password_hash: passwordHash,
      role: 'mitra',
      address: 'Jl. Asia Afrika No. 88, Bandung',
      latitude: -6.92113,
      longitude: 107.6096,
    },
  });

  const partner1 = await prisma.partner.create({
    data: {
      user_id: partnerUser1.id,
      partner_type: 'bengkel',
      business_name: 'Bengkel Maju Motor',
      address: 'Jl. Asia Afrika No. 88, Bandung',
      latitude: -6.92113,
      longitude: 107.6096,
      verification_status: 'approved',
      is_online: true,
      rating_average: 4.8,
      services: 'Servis Rutin, Tune Up, Ganti Oli, Perbaikan Rem, Overhaul',
      ktp_photo: '/uploads/dummy_ktp.jpg',
      business_photo: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=800&auto=format&fit=crop&q=80',
      qris_photo: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=OTOVA-MAJUMOTOR-PAY',
    },
  });

  // Partner 2: Montir Freelance Approved
  const partnerUser2 = await prisma.user.create({
    data: {
      full_name: 'Agus Montir',
      email: 'agusmontir@gmail.com',
      phone_number: '087822334455',
      password_hash: passwordHash,
      role: 'mitra',
      address: 'Jl. Dago No. 102, Bandung',
      latitude: -6.89148,
      longitude: 107.61066,
    },
  });

  const partner2 = await prisma.partner.create({
    data: {
      user_id: partnerUser2.id,
      partner_type: 'teknisi',
      business_name: 'Montir Express Dago (Agus)',
      address: 'Jl. Dago No. 102, Bandung',
      latitude: -6.89148,
      longitude: 107.61066,
      verification_status: 'approved',
      is_online: true,
      rating_average: 4.9,
      services: 'Perbaikan Mogok, Kelistrikan, Ganti Busi, Karburator/Injeksi',
      ktp_photo: '/uploads/dummy_ktp.jpg',
      business_photo: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80',
      qris_photo: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=OTOVA-AGUSMONTIR-PAY',
    },
  });

  // Partner 3: Tambal Ban Approved
  const partnerUser3 = await prisma.user.create({
    data: {
      full_name: 'Pak Joko Tambal Ban',
      email: 'jokotambalban@gmail.com',
      phone_number: '089911223344',
      password_hash: passwordHash,
      role: 'mitra',
      address: 'Jl. Riau No. 15, Bandung',
      latitude: -6.90833,
      longitude: 107.61694,
    },
  });

  const partner3 = await prisma.partner.create({
    data: {
      user_id: partnerUser3.id,
      partner_type: 'tambal_ban',
      business_name: 'Tambal Ban Keliling Pak Joko',
      address: 'Jl. Riau No. 15, Bandung',
      latitude: -6.90833,
      longitude: 107.61694,
      verification_status: 'approved',
      is_online: true,
      rating_average: 4.7,
      services: 'Tambal Ban Tubeless, Tambal Ban Dalam, Pompa Angin, Ganti Ban Luar',
      ktp_photo: '/uploads/dummy_ktp.jpg',
      business_photo: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=800&auto=format&fit=crop&q=80',
      qris_photo: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=OTOVA-JOKOTAMBAL-PAY',
    },
  });

  // Partner 4: Pending Mitra (for Admin verification test)
  const partnerUser4 = await prisma.user.create({
    data: {
      full_name: 'Rian Sejahtera',
      email: 'riansejahtera@gmail.com',
      phone_number: '081233445566',
      password_hash: passwordHash,
      role: 'mitra',
      address: 'Jl. Buah Batu No. 200, Bandung',
      latitude: -6.95000,
      longitude: 107.63000,
    },
  });

  const partner4 = await prisma.partner.create({
    data: {
      user_id: partnerUser4.id,
      partner_type: 'bengkel',
      business_name: 'Bengkel Sejahtera Auto',
      address: 'Jl. Buah Batu No. 200, Bandung',
      latitude: -6.95000,
      longitude: 107.63000,
      verification_status: 'pending',
      is_online: false,
      rating_average: 5.0,
      services: 'Servis Berat, Cat & Body Work, Spooring Balancing',
      ktp_photo: '/uploads/dummy_ktp.jpg',
      business_photo: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80',
    },
  });

  // 4. Sample Orders
  const order1 = await prisma.order.create({
    data: {
      order_code: 'OTV-20260803-001',
      user_id: user1.id,
      partner_id: partner2.id,
      order_type: 'cari_bantuan',
      vehicle_type: 'motor',
      vehicle_brand: 'Honda Vario 150',
      complaint: 'Motor tiba-tiba mati mendadak di jalan dikoordinat dekat Dago. Tidak bisa distarter.',
      status: 'ditutup',
      subtotal_cost: 75000,
      additional_cost: 25000,
      cost_change_reason: 'Ganti busi baru Original Honda',
      cost_change_status: 'approved',
      total_cost: 100000,
    },
  });

  await prisma.payment.create({
    data: {
      order_id: order1.id,
      payment_method: 'qris',
      amount: 100000,
      payment_status: 'paid',
      paid_at: new Date(),
    },
  });

  await prisma.review.create({
    data: {
      order_id: order1.id,
      user_id: user1.id,
      partner_id: partner2.id,
      rating: 5,
      comment: 'Agus montir cepat sekali datangnya! Sangat membantu saat motor mogok jam 9 malam.',
    },
  });

  const order2 = await prisma.order.create({
    data: {
      order_code: 'OTV-20260803-002',
      user_id: user2.id,
      partner_id: partner1.id,
      order_type: 'booking_bengkel',
      vehicle_type: 'mobil',
      vehicle_brand: 'Toyota Avanza 2021',
      complaint: 'Servis berkala 20.000 KM dan ganti oli mesin.',
      status: 'sedang_dikerjakan',
      subtotal_cost: 350000,
      total_cost: 350000,
    },
  });

  await prisma.booking.create({
    data: {
      order_id: order2.id,
      partner_id: partner1.id,
      booking_date: '2026-08-04',
      booking_time: '10:00',
      service_type: 'Servis Berkala & Ganti Oli',
      status: 'dikonfirmasi',
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
