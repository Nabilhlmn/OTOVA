import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Hanya Admin yang berwenang' }, { status: 403 });
    }

    const body = await request.json();
    const { status, suspension_reason } = body;

    const validStatuses = ['approved', 'rejected', 'pending', 'suspended'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Status tidak valid' }, { status: 400 });
    }

    // Jika suspend, alasan wajib diisi
    if (status === 'suspended' && !suspension_reason) {
      return NextResponse.json({ error: 'Alasan pembekuan wajib diisi' }, { status: 400 });
    }

    const updateData: any = {
      verification_status: status,
      // suspended: paksa offline. approved: boleh online. lainnya: offline
      is_online: status === 'approved' ? true : false,
    };

    if (status === 'suspended') {
      updateData.suspension_reason = suspension_reason;
    } else {
      // Jika kembali aktif (approved/rejected/pending), hapus reason lama
      updateData.suspension_reason = null;
    }

    const updatedPartner = await prisma.partner.update({
      where: { id: params.id },
      data: updateData,
    });

    // Konfigurasi notifikasi berdasarkan status
    const notifConfig: Record<string, { title: string; message: string }> = {
      approved: {
        title: 'Akun Mitra Disetujui! ✅',
        message: 'Selamat! Akun mitra Anda telah diverifikasi. Anda dapat mulai menerima order.',
      },
      rejected: {
        title: 'Pengajuan Mitra Ditolak',
        message: 'Mohon maaf, pengajuan pendaftaran mitra Anda belum dapat disetujui oleh Admin.',
      },
      suspended: {
        title: '🔴 Akun Mitra Dibekukan',
        message: `Akun mitra Anda telah dibekukan karena: ${suspension_reason || 'Pelanggaran SOP'}. Hubungi Admin untuk informasi lebih lanjut.`,
      },
      pending: {
        title: 'Status Akun Dikembalikan ke Menunggu Verifikasi',
        message: 'Status akun mitra Anda telah direset oleh Admin. Harap tunggu proses verifikasi ulang.',
      },
    };

    const notif = notifConfig[status];
    if (notif) {
      await prisma.notification.create({
        data: {
          recipient_id: updatedPartner.user_id,
          title: notif.title,
          message: notif.message,
          type: 'verifikasi_mitra',
        },
      });
    }

    return NextResponse.json({ success: true, partner: updatedPartner });
  } catch (error: any) {
    console.error('Update partner status error:', error);
    return NextResponse.json({ error: 'Gagal memperbarui status mitra' }, { status: 500 });
  }
}
