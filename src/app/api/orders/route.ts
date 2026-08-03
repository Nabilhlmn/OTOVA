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
    if (status) whereClause.status = status;

    const queryWhere: any = { ...whereClause };
    if (partnerId) {
      const partner = await prisma.partner.findUnique({
        where: { id: partnerId },
      });
      if (partner && partner.is_online && partner.verification_status === 'approved') {
        // Autobid check
        if ((partner as any).is_autobid) {
          let isEligible = true;
          if (partner.partner_type === 'teknisi') {
            const activeOrder = await prisma.order.findFirst({
              where: {
                partner_id: partner.id,
                status: { in: ['diterima', 'menuju_lokasi', 'sampai_lokasi', 'sedang_dikerjakan'] },
              },
            });
            if (activeOrder) {
              isEligible = false;
            }
          }

          if (isEligible) {
            const waitingOrder = await prisma.order.findFirst({
              where: {
                status: 'menunggu_mitra',
                order_type: 'cari_bantuan',
              },
            });

            if (waitingOrder) {
              await prisma.order.update({
                where: { id: waitingOrder.id },
                data: {
                  partner_id: partner.id,
                  status: 'diterima',
                  updated_at: new Date(),
                },
              });

              await prisma.notification.create({
                data: {
                  recipient_id: partner.user_id,
                  title: 'Order Diterima Otomatis (Autobid)!',
                  message: `Order #${waitingOrder.order_code} telah otomatis diterima oleh fitur Autobid Anda.`,
                  type: 'order_baru',
                },
              });
            }
          }
        }

        queryWhere.OR = [
          { partner_id: partnerId, ...(status ? { status } : {}) },
          {
            order_type: 'cari_bantuan',
            status: 'menunggu_mitra',
          },
        ];
      } else {
        queryWhere.partner_id = partnerId;
      }
    }

    const orders = await prisma.order.findMany({
      where: queryWhere,
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

    if (!order_type || !vehicle_type || !vehicle_brand || !complaint) {
      return NextResponse.json(
        { error: 'Lengkapi semua field order yang diperlukan' },
        { status: 400 }
      );
    }

    if (order_type !== 'cari_bantuan' && !partner_id) {
      return NextResponse.json(
        { error: 'Lengkapi semua field order yang diperlukan' },
        { status: 400 }
      );
    }

    let finalPartnerId = partner_id;
    let partner = null;

    if (order_type === 'cari_bantuan' && !finalPartnerId) {
      // Find the first online approved partner
      const fallbackPartner = await prisma.partner.findFirst({
        where: {
          is_online: true,
          verification_status: 'approved',
        },
        include: { user: true },
      });

      if (!fallbackPartner) {
        return NextResponse.json(
          { error: 'Tidak ada mitra online/aktif saat ini di sekitar Anda. Silakan coba beberapa saat lagi.' },
          { status: 400 }
        );
      }
      partner = fallbackPartner;
      finalPartnerId = fallbackPartner.id;
    } else {
      partner = await prisma.partner.findUnique({
        where: { id: finalPartnerId },
        include: { user: true },
      });

      if (!partner) {
        return NextResponse.json({ error: 'Mitra tidak ditemukan' }, { status: 404 });
      }
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
        partner_id: finalPartnerId,
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
          partner_id: finalPartnerId,
          booking_date,
          booking_time,
          service_type: service_type || complaint,
          status: 'menunggu_konfirmasi',
        },
      });
    }

    // Notify Partner(s)
    if (order_type === 'cari_bantuan') {
      const onlinePartners = await prisma.partner.findMany({
        where: {
          is_online: true,
          verification_status: 'approved',
        },
        select: { user_id: true },
      });

      if (onlinePartners.length > 0) {
        await prisma.notification.createMany({
          data: onlinePartners.map((p) => ({
            recipient_id: p.user_id,
            title: 'Order Bantuan Baru!',
            message: `Order #${orderCode} dari ${session.full_name} (${vehicle_brand}). Mohon terima atau tolak.`,
            type: 'order_baru',
          })),
        });
      }
    } else {
      await prisma.notification.create({
        data: {
          recipient_id: partner.user_id,
          title: 'Booking Bengkel Baru!',
          message: `Order #${orderCode} dari ${session.full_name} (${vehicle_brand}). Mohon terima atau tolak.`,
          type: 'order_baru',
        },
      });
    }

    return NextResponse.json({ success: true, order: newOrder });
  } catch (error: any) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: 'Gagal membuat order' }, { status: 500 });
  }
}
