import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      full_name: true,
      email: true,
      phone_number: true,
      role: true,
      profile_photo: true,
      address: true,
      latitude: true,
      longitude: true,
      partner: true,
    },
  });

  return NextResponse.json({ authenticated: true, user });
}
