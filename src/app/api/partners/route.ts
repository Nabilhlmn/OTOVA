import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
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
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
    } = body;

    if (!partner_type || !business_name || !address) {
      return NextResponse.json(
        { error: 'Lengkapi field wajib registrasi mitra' },
        { status: 400 }
      );
    }

    // Update user role to mitra
    await prisma.user.update({
      where: { id: session.id },
      data: { role: 'mitra' },
    });

    const partner = await prisma.partner.create({
      data: {
        user_id: session.id,
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
