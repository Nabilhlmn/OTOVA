import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { verification_status } = body;

    if (!['approved', 'rejected'].includes(verification_status)) {
      return NextResponse.json({ error: 'Status verifikasi tidak valid' }, { status: 400 });
    }

    // Update partner status
    const partner = await prisma.partner.update({
      where: { id: params.id },
      data: {
        verification_status,
      },
    });

    // If approved, update user role to "mitra"
    if (verification_status === 'approved') {
      await prisma.user.update({
        where: { id: partner.user_id },
        data: {
          role: 'mitra',
        },
      });
    }

    return NextResponse.json({ success: true, partner });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Gagal mengubah status verifikasi' }, { status: 500 });
  }
}
