import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const partnerId = searchParams.get('partner_id');

    const whereClause: any = {};
    if (partnerId) whereClause.partner_id = partnerId;

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        order: {
          include: {
            user: { select: { full_name: true, phone_number: true } },
          },
        },
        partner: { select: { business_name: true } },
      },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json({ success: true, bookings });
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal mengambil data booking' }, { status: 500 });
  }
}
