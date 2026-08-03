import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { order_id, payment_method, amount } = await request.json();

    if (!order_id || !payment_method || !amount) {
      return NextResponse.json({ error: 'Lengkapi data pembayaran' }, { status: 400 });
    }

    const payment = await prisma.payment.create({
      data: {
        order_id,
        payment_method, // "tunai" | "qris"
        amount: Number(amount),
        payment_status: 'paid',
        paid_at: new Date(),
      },
    });

    // Update order status to 'dibayar'
    const order = await prisma.order.update({
      where: { id: order_id },
      data: { status: 'dibayar' },
      include: { partner: true },
    });

    // Credit partner wallet balance
    await prisma.partner.update({
      where: { id: order.partner_id },
      data: {
        balance: {
          increment: Number(amount),
        },
      },
    });

    // Notify Partner
    await prisma.notification.create({
      data: {
        recipient_id: order.partner.user_id,
        title: 'Pembayaran Diterima',
        message: `Pembayaran sebesar Rp ${Number(amount).toLocaleString(
          'id-ID'
        )} via ${payment_method.toUpperCase()} telah dikonfirmasi user.`,
        type: 'status_order',
      },
    });

    return NextResponse.json({ success: true, payment, order });
  } catch (error: any) {
    console.error('Payment error:', error);
    return NextResponse.json({ error: 'Gagal memproses pembayaran' }, { status: 500 });
  }
}
