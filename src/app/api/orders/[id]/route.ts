import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: { id: true, full_name: true, phone_number: true, email: true, address: true },
        },
        partner: {
          select: {
            id: true,
            business_name: true,
            partner_type: true,
            address: true,
            latitude: true,
            longitude: true,
            rating_average: true,
            qris_photo: true,
            user: { select: { phone_number: true, full_name: true } },
          },
        },
        booking: true,
        payment: true,
        review: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal mengambil detail order' }, { status: 500 });
  }
}
