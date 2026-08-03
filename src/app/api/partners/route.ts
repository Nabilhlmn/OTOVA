import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession, hashPassword, createSession } from '@/lib/auth';
import { calculateDistance } from '@/lib/distance';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const near = searchParams.get('near'); // lat,lng
    const onlineOnly = searchParams.get('onlineOnly') === 'true';

    const whereClause: any = {};
    if (type) whereClause.partner_type = type;
    if (status) whereClause.verification_status = status;
    if (onlineOnly) whereClause.is_online = true;

    const partners = await prisma.partner.findMany({
      where: whereClause,
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

    let results = partners.map((p) => ({
      ...p,
      distance_km: 0,
    }));

    if (near) {
      const [userLat, userLng] = near.split(',').map(Number);
      if (!isNaN(userLat) && !isNaN(userLng)) {
        results = results.map((p) => ({
          ...p,
          distance_km: calculateDistance(userLat, userLng, p.latitude, p.longitude),
        }));
        results.sort((a, b) => a.distance_km - b.distance_km);
      }
    }

    return NextResponse.json({ success: true, partners: results });
  } catch (error: any) {
    console.error('Get partners error:', error);
    return NextResponse.json({ error: 'Gagal mengambil data mitra' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const body = await request.json();
    const {
      partner_type,
      business_name,
      address,
      latitude,
      longitude,
      services,
      ktp_photo,
      business_photo,
      is_anonymous,
      full_name,
      email,
      phone_number,
      password,
    } = body;

    let targetUserId = session?.id || null;

    // Handle anonymous registration
    if (!targetUserId) {
      if (!is_anonymous || !full_name || !email || !phone_number || !password) {
        return NextResponse.json({ error: 'Unauthorized: Harap login atau lengkapi informasi akun utama' }, { status: 401 });
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });
      if (existingUser) {
        return NextResponse.json({ error: 'Email sudah terdaftar. Silakan login terlebih dahulu' }, { status: 400 });
      }

      const passwordHash = await hashPassword(password);

      // Create new User account
      const newUser = await prisma.user.create({
        data: {
          full_name,
          email,
          phone_number,
          password_hash: passwordHash,
          address,
          role: 'user', // Starts as normal 'user' role, upgraded to 'mitra' on verification approval
        },
      });

      targetUserId = newUser.id;

      // Automatically sign in the freshly created user session
      await createSession({
        id: newUser.id,
        email: newUser.email,
        full_name: newUser.full_name,
        role: newUser.role,
        partner_id: null,
        partner_status: 'pending',
      });
    }

    if (!partner_type || !business_name || !address) {
      return NextResponse.json(
        { error: 'Lengkapi field wajib registrasi mitra' },
        { status: 400 }
      );
    }

    // Check if user already has a partner application
    const existingPartner = await prisma.partner.findUnique({
      where: { user_id: targetUserId },
    });
    if (existingPartner) {
      return NextResponse.json({ error: 'Anda sudah terdaftar sebagai mitra atau pendaftaran Anda sedang diproses' }, { status: 400 });
    }

    const partner = await prisma.partner.create({
      data: {
        user_id: targetUserId,
        partner_type,
        business_name,
        address,
        latitude: Number(latitude) || -6.917464,
        longitude: Number(longitude) || 107.619123,
        services: services || '',
        ktp_photo: ktp_photo || '/uploads/ktp_default.jpg',
        business_photo: business_photo || 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=800&auto=format&fit=crop&q=80',
        verification_status: 'pending',
        is_online: false,
      },
    });

    // Create admin notification
    const admins = await prisma.user.findMany({ where: { role: 'admin' } });
    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          recipient_id: admin.id,
          title: 'Mitra Baru Mendaftar',
          message: `Mitra ${business_name} (${partner_type}) membutuhkan verifikasi admin.`,
          type: 'verifikasi_mitra',
        },
      });
    }

    return NextResponse.json({ success: true, partner });
  } catch (error: any) {
    console.error('Register partner error:', error);
    return NextResponse.json({ error: 'Gagal merestrasikan mitra' }, { status: 500 });
  }
}
