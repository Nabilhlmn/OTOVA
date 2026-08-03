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

    const { is_online, qris_photo, base_price_motor, base_price_mobil, services } = await request.json();

    const partner = await prisma.partner.findUnique({ where: { id: params.id } });
    if (!partner) {
      return NextResponse.json({ error: 'Mitra tidak ditemukan' }, { status: 404 });
    }

    if (partner.verification_status !== 'approved') {
      return NextResponse.json(
        { error: 'Akun Anda belum disetujui admin. Tidak dapat mengubah status online.' },
        { status: 400 }
      );
    }

    const dataToUpdate: any = {};
    if (typeof is_online === 'boolean') dataToUpdate.is_online = is_online;
    if (qris_photo !== undefined) dataToUpdate.qris_photo = qris_photo;
    if (typeof base_price_motor === 'number') dataToUpdate.base_price_motor = base_price_motor;
    if (typeof base_price_mobil === 'number') dataToUpdate.base_price_mobil = base_price_mobil;
    if (typeof services === 'string') dataToUpdate.services = services;

    const updated = await prisma.partner.update({
      where: { id: params.id },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, partner: updated });
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal mengubah status online' }, { status: 500 });
  }
}
