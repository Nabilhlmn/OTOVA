import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'mitra') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const partner = await prisma.partner.findUnique({
      where: { id: params.id },
    });

    if (!partner) {
      return NextResponse.json({ error: 'Mitra tidak ditemukan' }, { status: 404 });
    }

    // Verify it is their own partner account
    if (partner.user_id !== session.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { is_autobid } = await request.json();

    const updatedPartner = await prisma.partner.update({
      where: { id: params.id },
      data: { is_autobid: !!is_autobid } as any,
    });

    return NextResponse.json({ success: true, partner: updatedPartner });
  } catch (error: any) {
    console.error('Autobid toggle error:', error);
    return NextResponse.json({ error: 'Gagal mengubah pengaturan Autobid' }, { status: 500 });
  }
}
