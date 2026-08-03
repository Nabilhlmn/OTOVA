'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  Star,
  Phone,
  MapPin,
  Wrench,
  ShieldCheck,
  QrCode,
  DollarSign,
} from 'lucide-react';

const ORDER_STEPS = [
  { id: 'menunggu_mitra', label: 'Menunggu Mitra' },
  { id: 'diterima', label: 'Diterima' },
  { id: 'menuju_lokasi', label: 'Menuju Lokasi' },
  { id: 'tiba', label: 'Tiba di Lokasi' },
  { id: 'inspeksi', label: 'Inspeksi' },
  { id: 'menunggu_persetujuan_biaya', label: 'Persetujuan Biaya' },
  { id: 'sedang_dikerjakan', label: 'Sedang Dikerjakan' },
  { id: 'selesai', label: 'Selesai' },
  { id: 'dibayar', label: 'Dibayar' },
  { id: 'ditutup', label: 'Ditutup' },
];

export default function OrderTrackerPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Modal payment state
  const [paymentMethod, setPaymentMethod] = useState<'tunai' | 'qris'>('qris');
  // Review state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const fetchOrder = () => {
    fetch(`/api/orders/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setOrder(data.order);
        setLoading(false);
      });
  };

  const handleCancelOrder = async () => {
    if (!confirm('Apakah Anda yakin ingin membatalkan order ini?')) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/orders/${params.id}/cancel`, {
        method: 'PATCH',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      fetchOrder();
    } catch (e: any) {
      alert(e.message || 'Gagal membatalkan order');
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 4000); // Polling order updates every 4 seconds
    return () => clearInterval(interval);
  }, [params.id]);

  const handleCostApproval = async (approve: boolean) => {
    setActionLoading(true);
    try {
      await fetch(`/api/orders/${params.id}/cost-change`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approve }),
      });
      fetchOrder();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePaymentSubmit = async () => {
    setActionLoading(true);
    try {
      await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: order.id,
          payment_method: paymentMethod,
          amount: order.total_cost,
        }),
      });
      fetchOrder();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReviewSubmit = async () => {
    setActionLoading(true);
    try {
      await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: order.id,
          partner_id: order.partner_id,
          rating,
          comment,
        }),
      });
      fetchOrder();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="text-center py-16 text-gray-400 text-xs">Memuat data order...</div>;
  if (!order) return <div className="text-center py-16 text-gray-400 text-xs">Order tidak ditemukan.</div>;

  const currentStepIndex = ORDER_STEPS.findIndex((s) => s.id === order.status);

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4">
      {/* Header Info */}
      <div className="glass-card p-6 rounded-3xl space-y-3 border border-emerald-500/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-500/30">
              Order Kode: #{order.order_code}
            </span>
            <h1 className="text-xl font-extrabold text-white mt-1">
              Live Tracker Bantuan & Servis
            </h1>
            <p className="text-xs text-gray-400">
              Mitra: <strong className="text-white">{order.partner?.business_name}</strong> •{' '}
              {order.vehicle_brand}
            </p>
          </div>

          <div className="text-right flex flex-col sm:flex-row items-end sm:items-center gap-2">
            <span
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
                order.status === 'dibatalkan'
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                  : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
              }`}
            >
              {order.status.replace(/_/g, ' ')}
            </span>

            {(order.status === 'menunggu_mitra' || order.status === 'diterima') && (
              <button
                onClick={handleCancelOrder}
                disabled={actionLoading}
                className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/40 transition-all shadow-md"
              >
                {actionLoading ? 'Membatalkan...' : '❌ Batalkan Order'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 10-Status Stepper Visualization */}
      <div className="glass-card p-6 rounded-3xl border border-gray-800 space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
          <Clock className="w-4 h-4" /> Progress Siklus Order (10 Tahapan)
        </h2>

        <div className="flex sm:grid sm:grid-cols-5 gap-2 pt-2 overflow-x-auto pb-2 scroll-smooth snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {ORDER_STEPS.map((step, idx) => {
            const isCompleted = idx <= currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            return (
              <div
                key={step.id}
                className={`p-3 rounded-xl border text-center transition-all shrink-0 w-[130px] sm:w-auto snap-center ${
                  isCurrent
                    ? 'bg-emerald-500/20 border-emerald-500 text-white font-bold animate-pulse'
                    : isCompleted
                    ? 'bg-gray-900 border-emerald-500/30 text-emerald-400'
                    : 'bg-gray-950/40 border-gray-800/80 text-gray-600'
                }`}
              >
                <span className="text-[10px] block opacity-75">{idx + 1}.</span>
                <span className="text-[11px] leading-tight block font-semibold">{step.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* COST CHANGE APPROVAL MODAL / BANNER */}
      {order.status === 'menunggu_persetujuan_biaya' && (
        <div className="glass-card p-6 rounded-3xl border-2 border-amber-500/50 bg-amber-950/20 space-y-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-amber-300">Pengajuan Perubahan Biaya Tambahan!</h3>
              <p className="text-xs text-gray-200">
                Mitra menemukan kebutuhan perbaikan/sparepart tambahan hasil inspeksi:
              </p>
              <div className="p-3 rounded-xl bg-gray-900/80 text-xs space-y-1 my-2">
                <p className="text-amber-400 font-bold">
                  Biaya Tambahan: +Rp {order.additional_cost?.toLocaleString('id-ID')}
                </p>
                <p className="text-gray-300">Alasan: {order.cost_change_reason}</p>
                <p className="text-emerald-400 font-bold pt-1">
                  Total Biaya Akhir: Rp {(order.subtotal_cost + (order.additional_cost || 0)).toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleCostApproval(true)}
              disabled={actionLoading}
              className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all"
            >
              {actionLoading ? 'Memproses...' : 'Setujui Perubahan Biaya'}
            </button>
            <button
              onClick={() => handleCostApproval(false)}
              disabled={actionLoading}
              className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-lg shadow-rose-600/20 transition-all"
            >
              Tolak Perubahan Biaya
            </button>
          </div>
        </div>
      )}

      {/* PAYMENT MODAL (Status: Selesai) */}
      {order.status === 'selesai' && (
        <div className="glass-card p-6 rounded-3xl border-2 border-emerald-500/40 bg-emerald-950/20 space-y-4">
          <div className="flex items-center gap-3">
            <CreditCard className="w-6 h-6 text-emerald-400" />
            <div>
              <h3 className="text-base font-bold text-white">Pekerjaan Selesai! Lakukan Pembayaran</h3>
              <p className="text-xs text-gray-300">
                Total Tagihan: <strong className="text-emerald-400">Rp {order.total_cost.toLocaleString('id-ID')}</strong>
              </p>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-300">Pilih Metode Pembayaran</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPaymentMethod('qris')}
                className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  paymentMethod === 'qris'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                    : 'bg-gray-900 border-gray-800 text-gray-400'
                }`}
              >
                <QrCode className="w-4 h-4" /> QRIS Statis Mitra
              </button>
              <button
                onClick={() => setPaymentMethod('tunai')}
                className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  paymentMethod === 'tunai'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                    : 'bg-gray-900 border-gray-800 text-gray-400'
                }`}
              >
                <DollarSign className="w-4 h-4" /> Tunai / Cash
              </button>
            </div>
          </div>

          {paymentMethod === 'qris' && order.partner?.qris_photo && (
            <div className="p-4 rounded-2xl bg-gray-900 border border-gray-800 text-center space-y-2">
              <span className="text-xs font-bold text-gray-200">Scan QRIS Mitra untuk Membayar</span>
              <img
                src={order.partner.qris_photo}
                alt="QRIS Mitra"
                className="w-48 h-48 mx-auto object-contain rounded-xl border border-gray-700"
              />
            </div>
          )}

          <button
            onClick={handlePaymentSubmit}
            disabled={actionLoading}
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all"
          >
            {actionLoading ? 'Konfirmasi...' : 'Konfirmasi Pembayaran Selesai'}
          </button>
        </div>
      )}

      {/* REVIEW & RATING MODAL (Status: Dibayar) */}
      {(order.status === 'dibayar' || order.status === 'ditutup') && !order.review && (
        <div className="glass-card p-6 rounded-3xl border-2 border-amber-500/40 bg-amber-950/20 space-y-4">
          <div className="flex items-center gap-3">
            <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
            <div>
              <h3 className="text-base font-bold text-white">Beri Ulasan & Rating Mitra</h3>
              <p className="text-xs text-gray-300">Bagikan pengalaman layanan bantuan Anda.</p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 py-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="p-1 transition-transform hover:scale-125"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-600'
                  }`}
                />
              </button>
            ))}
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Tulis ulasan/pesan untuk mitra ini..."
            className="w-full px-4 py-2.5 rounded-xl glass-input text-xs resize-none"
          />

          <button
            onClick={handleReviewSubmit}
            disabled={actionLoading}
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-lg shadow-amber-500/20 transition-all"
          >
            {actionLoading ? 'Menyimpan Ulasan...' : 'Kirim Ulasan & Tutup Order'}
          </button>
        </div>
      )}

      {/* Order Details & Summary Card */}
      <div className="glass-card p-6 rounded-3xl border border-gray-800 space-y-4">
        <h3 className="text-sm font-bold text-white pb-2 border-b border-gray-800">
          Rincian Transaksi
        </h3>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-gray-400 block">Jenis Permintaan:</span>
            <span className="font-bold text-white capitalize">
              {order.order_type.replace('_', ' ')}
            </span>
          </div>

          <div>
            <span className="text-gray-400 block">Kendaraan:</span>
            <span className="font-bold text-white">{order.vehicle_brand}</span>
          </div>

          <div>
            <span className="text-gray-400 block">Keluhan User:</span>
            <span className="font-semibold text-gray-200">{order.complaint}</span>
          </div>

          <div>
            <span className="text-gray-400 block">Telepon Mitra:</span>
            <span className="font-bold text-emerald-400 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 inline" /> {order.partner?.user?.phone_number || '-'}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-gray-900/60 border border-gray-800 space-y-1 text-xs">
          <div className="flex items-center justify-between text-gray-400">
            <span>Estimasi Biaya Awal:</span>
            <span>Rp {order.subtotal_cost.toLocaleString('id-ID')}</span>
          </div>
          {order.additional_cost && (
            <div className="flex items-center justify-between text-amber-400 font-semibold">
              <span>Biaya Tambahan:</span>
              <span>+Rp {order.additional_cost.toLocaleString('id-ID')}</span>
            </div>
          )}
          <div className="flex items-center justify-between text-white font-bold text-sm pt-2 border-t border-gray-800">
            <span>Total Tagihan:</span>
            <span className="text-emerald-400">Rp {order.total_cost.toLocaleString('id-ID')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
