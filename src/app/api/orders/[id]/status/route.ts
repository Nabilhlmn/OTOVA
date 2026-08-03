import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

const VALID_STATUSES = [
  'menunggu_mitra',
  'diterima',
  'menuju_lokasi',
  'tiba',
  'inspeksi',
  'menunggu_persetujuan_biaya',
  'sedang_dikerjakan',
  'selesai',
  'dibayar',
  'ditutup',
];

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status } = await request.json();
    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Status order tidak valid' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: { partner: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order tidak ditemukan' }, { status: 404 });
    }

    const partner = await prisma.partner.findFirst({
      where: { user_id: session.id },
    });

    if (!partner) {
      return NextResponse.json({ error: 'Pengguna bukan terdaftar sebagai mitra' }, { status: 403 });
    }

    if (status === 'diterima') {
      if (order.status !== 'menunggu_mitra') {
        return NextResponse.json({ error: 'Order ini sudah diterima oleh mitra lain' }, { status: 400 });
      }

      if (partner.partner_type === 'teknisi') {
        const activeOrder = await prisma.order.findFirst({
          where: {
            partner_id: partner.id,
            status: {
              in: [
                'diterima',
                'menuju_lokasi',
                'tiba',
                'inspeksi',
                'menunggu_persetujuan_biaya',
                'sedang_dikerjakan',
              ],
            },
            id: { not: order.id },
          },
        });

        if (activeOrder) {
          return NextResponse.json(
            { error: 'Anda masih memiliki orderan aktif yang sedang berjalan' },
            { status: 400 }
          );
        }
      }
    }

    const dataUpdate: any = { status };
    if (status === 'diterima') {
      dataUpdate.partner_id = partner.id;
    }

    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: dataUpdate,
    });

    // If order reaches 'selesai' or 'diterima', update booking status if any
    if (order.order_type === 'booking_bengkel') {
      let bookingStatus = 'menunggu_konfirmasi';
      if (status === 'diterima') bookingStatus = 'dikonfirmasi';
      if (status === 'selesai' || status === 'dibayar' || status === 'ditutup') bookingStatus = 'selesai';

      await prisma.booking.updateMany({
        where: { order_id: order.id },
        data: { status: bookingStatus },
      });
    }

    // Send notifications to user or partner depending on status change
    let recipientId = order.user_id;
    let title = `Update Order #${order.order_code}`;
    let message = `Status order Anda sekarang: ${status.replace(/_/g, ' ').toUpperCase()}`;

    if (status === 'menunggu_mitra') {
      recipientId = order.partner.user_id;
    }

    await prisma.notification.create({
      data: {
        recipient_id: recipientId,
        title,
        message,
        type: 'status_order',
      },
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error: any) {
    console.error('Update order status error:', error);
    return NextResponse.json({ error: 'Gagal memperbarui status order' }, { status: 500 });
  }
}
