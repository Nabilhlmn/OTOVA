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

    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: { status },
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
