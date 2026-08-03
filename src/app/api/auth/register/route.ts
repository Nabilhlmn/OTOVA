import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, createSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { full_name, email, phone_number, password, role = 'user', address } = body;

    if (!full_name || !email || !password || !phone_number) {
      return NextResponse.json(
        { error: 'Lengkapi semua field pendaftaran' },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar. Silakan login.' },
        { status: 400 }
      );
    }

    const password_hash = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        full_name,
        email,
        phone_number,
        password_hash,
        role,
        address: address || '',
        latitude: -6.917464, // Default Bandung coordinate
        longitude: 107.619123,
      },
    });

    const sessionPayload = {
      id: newUser.id,
      email: newUser.email,
      full_name: newUser.full_name,
      role: newUser.role,
      partner_id: null,
      partner_status: null,
    };

    await createSession(sessionPayload);

    let redirectUrl = '/dashboard';
    if (newUser.role === 'mitra') redirectUrl = '/register-mitra';
    if (newUser.role === 'admin') redirectUrl = '/admin/dashboard';

    return NextResponse.json({
      success: true,
      user: sessionPayload,
      redirectUrl,
    });
  } catch (error: any) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Gagal merestrasikan akun' },
      { status: 500 }
    );
  }
}
