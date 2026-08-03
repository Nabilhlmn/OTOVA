import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

// POST: Mitra submit cost change
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'mitra') {
      return NextResponse.json({ error: 'Hanya mitra yang dapat mengajukan perubahan biaya' }, { status: 403 });
    }

    const { additional_cost, reason } = await request.json();
    const additional = Number(additional_cost);

    if (isNaN(additional) || additional <= 0 || !reason) {
      return NextResponse.json(
        { error: 'Masukkan jumlah biaya tambahan dan alasan yang valid' },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({ where: { id: params.id } });
    if (!order) {
      return NextResponse.json({ error: 'Order tidak ditemukan' }, { status: 404 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: {
        additional_cost: additional,
        cost_change_reason: reason,
        cost_change_status: 'pending',
        status: 'menunggu_persetujuan_biaya',
      },
    });

    // Notify User
    await prisma.notification.create({
      data: {
        recipient_id: order.user_id,
        title: 'Pengajuan Perubahan Biaya',
        message: `Mitra mengajukan tambahan biaya Rp ${additional.toLocaleString('id-ID')} untuk: ${reason}. Mohon konfirmasi.`,
        type: 'perubahan_biaya',
      },
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal mengajukan perubahan biaya' }, { status: 500 });
  }
}

// PATCH: User approve or reject cost change
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { approve } = await request.json(); // boolean true or false

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: { partner: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order tidak ditemukan' }, { status: 404 });
    }

    let newStatus = 'sedang_dikerjakan';
    let newTotal = order.subtotal_cost;
    let costStatus = 'rejected';

    if (approve) {
      costStatus = 'approved';
      newTotal = order.subtotal_cost + (order.additional_cost || 0);
    }

    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: {
        cost_change_status: costStatus,
        total_cost: newTotal,
        status: newStatus,
      },
    });

    // Notify partner
    await prisma.notification.create({
      data: {
        recipient_id: order.partner.user_id,
        title: approve ? 'Perubahan Biaya Disetujui' : 'Perubahan Biaya Ditolak',
        message: approve
          ? `User menyetujui biaya tambahan. Total biaya sekarang Rp ${newTotal.toLocaleString('id-ID')}. Silakan lanjutkan pekerjaan.`
          : 'User menolak perubahan biaya.',
        type: 'perubahan_biaya',
      },
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal memperbarui persetujuan biaya' }, { status: 500 });
  }
}
