import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const notifications = await prisma.notification.findMany({
      where: { recipient_id: session.id },
      orderBy: { created_at: 'desc' },
      take: 20,
    });

    const unreadCount = await prisma.notification.count({
      where: { recipient_id: session.id, is_read: false },
    });

    return NextResponse.json({ success: true, notifications, unreadCount });
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal mengambil notifikasi' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await request.json();

    if (id) {
      await prisma.notification.update({
        where: { id },
        data: { is_read: true },
      });
    } else {
      // Mark all as read
      await prisma.notification.updateMany({
        where: { recipient_id: session.id, is_read: false },
        data: { is_read: true },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Gagal menandai notifikasi' }, { status: 500 });
  }
}
