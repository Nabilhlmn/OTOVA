import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const partner = await prisma.partner.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            full_name: true,
            email: true,
            phone_number: true,
            profile_photo: true,
          },
        },
        reviews: {
          include: {
            user: { select: { full_name: true, profile_photo: true } },
          },
          orderBy: { created_at: 'desc' },
        },
      },
    });

    if (!partner) {
      return NextResponse.json({ error: 'Mitra tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, partner });
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal mengambil detail mitra' }, { status: 500 });
  }
}
