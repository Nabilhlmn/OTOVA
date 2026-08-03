import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const partnerId = searchParams.get('partner_id');
    const status = searchParams.get('status');

    const whereClause: any = {};
    if (userId) whereClause.user_id = userId;
    if (partnerId) whereClause.partner_id = partnerId;
    if (status) whereClause.status = status;

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        user: {
          select: { full_name: true, phone_number: true, email: true, address: true },
        },
        partner: {
          select: {
            business_name: true,
            partner_type: true,
            address: true,
            qris_photo: true,
            user: { select: { phone_number: true } },
          },
        },
        booking: true,
        payment: true,
        review: true,
      },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    console.error('Get orders error:', error);
    return NextResponse.json({ error: 'Gagal mengambil data order' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      partner_id,
      order_type, // "cari_bantuan" | "booking_bengkel"
      vehicle_type, // "motor" | "mobil"
      vehicle_brand,
      complaint,
      vehicle_photo,
      booking_date,
      booking_time,
      service_type,
    } = body;

    if (!partner_id || !order_type || !vehicle_type || !vehicle_brand || !complaint) {
      return NextResponse.json(
        { error: 'Lengkapi semua field order yang diperlukan' },
        { status: 400 }
      );
    }

    const partner = await prisma.partner.findUnique({
      where: { id: partner_id },
      include: { user: true },
    });

    if (!partner) {
      return NextResponse.json({ error: 'Mitra tidak ditemukan' }, { status: 404 });
    }

    // Dynamic price estimation based on Partner's configured rates
    const calculateEstimatedCost = () => {
      const isMobil = vehicle_type === 'mobil';

      // 1. Base rate configured by partner
      let base = isMobil
        ? (partner.base_price_mobil || 75000)
        : (partner.base_price_motor || 35000);

      // Add multiplier if it's booking bengkel
      if (order_type === 'booking_bengkel') {
        base = Math.round(base * 1.5);
      }

      // 2. Extra cost based on service/complaint keywords
      const text = `${service_type || ''} ${complaint || ''}`.toLowerCase();
      let extra = 0;

      if (text.includes('towing') || text.includes('derek') || text.includes('evakuasi')) {
        extra += isMobil ? 150000 : 50000;
      } else if (text.includes('oli') || text.includes('servis berkala') || text.includes('tune up')) {
        extra += isMobil ? 90000 : 40000;
      } else if (text.includes('aki') || text.includes('jumper') || text.includes('baterai')) {
        extra += isMobil ? 50000 : 25000;
      } else if (text.includes('ban') || text.includes('bocor') || text.includes('tambal')) {
        extra += isMobil ? 35000 : 15000;
      } else if (text.includes('mesin') || text.includes('mogok') || text.includes('karbu') || text.includes('injeksi')) {
        extra += isMobil ? 70000 : 30000;
      }

      return base + extra;
    };

    const subtotal = calculateEstimatedCost();

    const orderCode = `OTV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    const newOrder = await prisma.order.create({
      data: {
        order_code: orderCode,
        user_id: session.id,
        partner_id,
        order_type,
        vehicle_type,
        vehicle_brand,
        complaint,
        vehicle_photo: vehicle_photo || null,
        status: 'menunggu_mitra',
        subtotal_cost: subtotal,
        total_cost: subtotal,
      },
    });

    if (order_type === 'booking_bengkel' && booking_date && booking_time) {
      await prisma.booking.create({
        data: {
          order_id: newOrder.id,
          partner_id,
          booking_date,
          booking_time,
          service_type: service_type || complaint,
          status: 'menunggu_konfirmasi',
        },
      });
    }

    // Notify Partner
    await prisma.notification.create({
      data: {
        recipient_id: partner.user_id,
        title: order_type === 'cari_bantuan' ? 'Order Bantuan Baru!' : 'Booking Bengkel Baru!',
        message: `Order #${orderCode} dari ${session.full_name} (${vehicle_brand}). Mohon terima atau tolak.`,
        type: 'order_baru',
      },
    });

    return NextResponse.json({ success: true, order: newOrder });
  } catch (error: any) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: 'Gagal membuat order' }, { status: 500 });
  }
}
