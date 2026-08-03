import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { order_id, partner_id, rating, comment } = await request.json();

    if (!order_id || !partner_id || !rating) {
      return NextResponse.json({ error: 'Rating dan order ID wajib diisi' }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        order_id,
        user_id: session.id,
        partner_id,
        rating: Number(rating),
        comment: comment || '',
      },
    });

    // Close order status to 'ditutup'
    await prisma.order.update({
      where: { id: order_id },
      data: { status: 'ditutup' },
    });

    // Recalculate partner average rating
    const partnerReviews = await prisma.review.aggregate({
      where: { partner_id },
      _avg: { rating: true },
    });

    if (partnerReviews._avg.rating) {
      await prisma.partner.update({
        where: { id: partner_id },
        data: { rating_average: Math.round(partnerReviews._avg.rating * 10) / 10 },
      });
    }

    return NextResponse.json({ success: true, review });
  } catch (error: any) {
    console.error('Review error:', error);
    return NextResponse.json({ error: 'Gagal menyimpan ulasan' }, { status: 500 });
  }
}
