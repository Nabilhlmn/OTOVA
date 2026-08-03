import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const order = await prisma.order.findUnique({ where: { id: params.id } });
    if (!order) {
      return NextResponse.json({ error: 'Order tidak ditemukan' }, { status: 404 });
    }

    // Pastikan order milik user yang sedang login atau admin
    if (order.user_id !== session.id && session.role !== 'admin') {
      return NextResponse.json({ error: 'Tidak memiliki akses' }, { status: 403 });
    }

    // Hanya bisa dibatalkan jika masih menunggu_mitra atau menunggu_konfirmasi
    if (order.status !== 'menunggu_mitra' && order.status !== 'diterima') {
      return NextResponse.json(
        { error: 'Order tidak dapat dibatalkan karena sudah dalam proses teknisi/bengkel.' },
        { status: 400 }
      );
    }

    const updated = await prisma.order.update({
      where: { id: params.id },
      data: { status: 'dibatalkan' },
    });

    // Kirim notifikasi ke mitra bahwa order dibatalkan user
    await prisma.notification.create({
      data: {
        recipient_id: order.partner_id,
        title: 'Order Dibatalkan',
        message: `Order #${order.order_code} telah dibatalkan oleh Pengguna.`,
        type: 'status_order',
      },
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal membatalkan order' }, { status: 500 });
  }
}
