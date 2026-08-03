import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'mitra') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const partner = await prisma.partner.findUnique({
      where: { user_id: session.id },
    });

    if (!partner) {
      return NextResponse.json({ error: 'Mitra tidak ditemukan' }, { status: 404 });
    }

    const amount = partner.balance;
    if (amount <= 0) {
      return NextResponse.json({ error: 'Saldo dompet Anda kosong' }, { status: 400 });
    }

    // Reset balance to 0
    await prisma.partner.update({
      where: { id: partner.id },
      data: { balance: 0.0 },
    });

    // Create a notification for the user
    await prisma.notification.create({
      data: {
        recipient_id: session.id,
        title: 'Penarikan Saldo Berhasil',
        message: `Penarikan saldo sebesar Rp ${amount.toLocaleString('id-ID')} berhasil diproses ke rekening terdaftar Anda.`,
        type: 'info',
      },
    });

    return NextResponse.json({ success: true, amount });
  } catch (error: any) {
    console.error('Withdraw error:', error);
    return NextResponse.json({ error: 'Gagal melakukan penarikan saldo' }, { status: 500 });
  }
}
