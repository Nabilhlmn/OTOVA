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

    // 30-second redirect timeout logic for emergency order ('cari_bantuan')
    if (order.order_type === 'cari_bantuan' && order.status === 'menunggu_mitra') {
      const elapsedSeconds = (Date.now() - new Date(order.updated_at).getTime()) / 1000;
      if (elapsedSeconds >= 30.0) {
        const nextPartner = await prisma.partner.findFirst({
          where: {
            id: { not: order.partner_id },
            is_online: true,
            verification_status: 'approved',
          },
        });

        if (nextPartner) {
          const updatedOrder = await prisma.order.update({
            where: { id: order.id },
            data: {
              partner_id: nextPartner.id,
              updated_at: new Date(),
            },
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

          // Create notification for the newly assigned partner
          await prisma.notification.create({
            data: {
              recipient_id: (nextPartner as any).user_id,
              title: 'Order Bantuan Darurat Dialihkan!',
              message: `Order #${updatedOrder.order_code} dialihkan ke Anda (tidak direspon mitra sebelumnya). Mohon terima segera!`,
              type: 'order_baru',
            },
          });

          return NextResponse.json({ success: true, order: updatedOrder });
        }
      }
    }

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal mengambil detail order' }, { status: 500 });
  }
}
