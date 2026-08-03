'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Store,
  Power,
  AlertCircle,
  Star,
  ChevronRight,
  ShieldBan,
  PhoneCall,
  Wrench,
  Wallet,
  DollarSign,
} from 'lucide-react';

export default function MitraDashboard() {
  const [partner, setPartner] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [isAutobid, setIsAutobid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);

  const handleWithdraw = async () => {
    if (!partner || (partner.balance || 0) <= 0) {
      alert("Saldo dompet Anda kosong.");
      return;
    }
    if (!confirm(`Apakah Anda yakin ingin menarik saldo sebesar Rp ${partner.balance.toLocaleString('id-ID')}?`)) {
      return;
    }
    setWithdrawing(true);
    try {
      const res = await fetch('/api/partners/withdraw', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menarik saldo');
      alert(`Penarikan saldo sebesar Rp ${data.amount.toLocaleString('id-ID')} berhasil diproses ke rekening Anda!`);
      fetchDashboardData();
    } catch (e: any) {
      alert(e.message || 'Penarikan gagal');
    } finally {
      setWithdrawing(false);
    }
  };

  const fetchDashboardData = () => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user.partner) {
          setPartner(data.user.partner);
          setIsOnline(data.user.partner.is_online);
          setIsAutobid(data.user.partner.is_autobid || false);

          // Fetch orders assigned to this partner
          fetch(`/api/orders?partner_id=${data.user.partner.id}`)
            .then((r) => r.json())
            .then((oData) => {
              if (oData.success) setOrders(oData.orders);
              setLoading(false);
            });
        } else {
          setLoading(false);
        }
      });
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const toggleOnlineStatus = async () => {
    if (!partner) return;
    try {
      const newStatus = !isOnline;
      const res = await fetch(`/api/partners/${partner.id}/online-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_online: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setIsOnline(newStatus);
    } catch (e: any) {
      alert(e.message || 'Gagal mengubah status online');
    }
  };

  const toggleAutobidStatus = async () => {
    if (!partner) return;
    try {
      const newStatus = !isAutobid;
      const res = await fetch(`/api/partners/${partner.id}/autobid`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_autobid: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setIsAutobid(newStatus);
    } catch (e: any) {
      alert(e.message || 'Gagal mengubah status Autobid');
    }
  };

  if (loading) return <div className="text-center py-16 text-gray-400 text-xs">Memuat dashboard mitra...</div>;
  if (!partner) {
    return (
      <div className="glass-card p-8 rounded-3xl text-center space-y-4 max-w-lg mx-auto py-12">
        <Store className="w-12 h-12 text-teal-400 mx-auto" />
        <h2 className="text-lg font-bold text-white">Anda Belum Terdaftar Sebagai Mitra</h2>
        <p className="text-xs text-gray-400">
          Silakan lengkapi formulir pendaftaran mitra untuk mulai menerima order.
        </p>
        <Link
          href="/register-mitra"
          className="inline-block px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs"
        >
          Daftar Mitra Sekarang
        </Link>
      </div>
    );
  }

  const pendingVerification = partner.verification_status === 'pending';
  const isSuspended = partner.verification_status === 'suspended';
  const incomingOrders = orders.filter((o) => o.status === 'menunggu_mitra');
  const activeOrders = orders.filter(
    (o) => o.status !== 'menunggu_mitra' && o.status !== 'ditutup' && o.status !== 'dibatalkan'
  );
  const completedOrders = orders.filter((o) => o.status === 'ditutup' || o.status === 'dibayar');
  const totalEarnings = completedOrders.reduce((sum, o) => sum + (o.total_cost || 0), 0);

  return (
    <div className="space-y-6 py-4">
      {/* ====== SUSPENDED BANNER (Prioritas Tertinggi) ====== */}
      {isSuspended && (
        <div className="glass-card p-5 sm:p-6 rounded-2xl border-2 border-red-600/60 bg-red-950/30 space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-red-500/20 shrink-0">
              <ShieldBan className="w-6 h-6 text-red-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-red-300">🔴 Akun Mitra Anda Dibekukan oleh Admin</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Akun Anda saat ini <strong className="text-red-400">tidak dapat menerima order baru</strong> karena telah dibekukan.
              </p>
              {partner.suspension_reason && (
                <div className="p-3 rounded-xl bg-red-950/50 border border-red-600/30 text-xs space-y-0.5 mt-2">
                  <span className="text-red-400 font-bold block">Alasan Pembekuan:</span>
                  <span className="text-gray-200">{partner.suspension_reason}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-red-600/20">
            <PhoneCall className="w-4 h-4 text-red-400" />
            <p className="text-xs text-gray-300">
              Hubungi Admin Otova untuk mengajukan keberatan atau perbaikan: <strong className="text-white">admin@otova.com</strong>
            </p>
          </div>
        </div>
      )}

      {/* Verification Warning Banner if Pending */}
      {pendingVerification && (
        <div className="glass-card p-4 sm:p-5 rounded-2xl border-2 border-amber-500/50 bg-amber-950/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-amber-400 shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-amber-300">Akun Menunggu Verifikasi Admin</h3>
              <p className="text-xs text-gray-300">
                Dokumen pendaftaran KTP & usaha Anda sedang diperiksa tim admin Otova.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 whitespace-nowrap">
            Status: PENDING
          </span>
        </div>
      )}

      {/* Header Profile & Online Toggle */}
      <div className="glass-card p-6 rounded-3xl border border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-950 text-emerald-400 border border-emerald-500/30">
              MITRA {partner.partner_type.replace('_', ' ')}
            </span>
            <span className="text-amber-400 text-xs font-bold flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400" /> {partner.rating_average.toFixed(1)}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">{partner.business_name}</h1>
          <p className="text-xs text-gray-400">{partner.address}</p>
        </div>

        {/* Toggle Online Button — diblokir jika suspended */}
        {isSuspended ? (
          <div className="px-5 py-3 rounded-2xl bg-red-950/40 border border-red-600/40 text-red-400 font-bold text-xs flex items-center gap-2.5">
            <ShieldBan className="w-4 h-4" /> Akun Dibekukan Admin
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/mitra/profil"
              className="px-4 py-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold text-xs flex items-center gap-2 transition-all shadow-md"
            >
              <Wrench className="w-4 h-4" /> Atur Tarif Estimasi
            </Link>
            <button
              onClick={toggleAutobidStatus}
              disabled={pendingVerification}
              className={`px-5 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all shadow-lg ${
                isAutobid
                  ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-400'
              }`}
            >
              <Store className="w-4 h-4" />
              {isAutobid ? 'Autobid: AKTIF' : 'Autobid: MATI'}
            </button>
            <button
              onClick={toggleOnlineStatus}
              disabled={pendingVerification}
              className={`px-5 py-3 rounded-2xl font-bold text-xs flex items-center gap-2.5 transition-all shadow-lg ${
                isOnline
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-400'
              }`}
            >
              <Power className={`w-4 h-4 ${isOnline ? 'animate-pulse' : ''}`} />
              {isOnline ? 'Status: ONLINE' : 'Status: OFFLINE'}
            </button>
          </div>
        )}
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-gray-800 space-y-1">
          <span className="text-xs text-gray-400 font-semibold">Order Masuk Baru</span>
          <div className="text-2xl font-extrabold text-emerald-400">{incomingOrders.length}</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-gray-800 space-y-1">
          <span className="text-xs text-gray-400 font-semibold">Pekerjaan Berlangsung</span>
          <div className="text-2xl font-extrabold text-blue-400">{activeOrders.length}</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-gray-800 space-y-1">
          <span className="text-xs text-gray-400 font-semibold">Total Order Selesai</span>
          <div className="text-2xl font-extrabold text-purple-400">{completedOrders.length}</div>
        </div>
      </div>

      {/* Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-emerald-500/20 bg-emerald-950/10 flex items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="text-xs text-gray-400 font-semibold flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-400" /> Total Pendapatan Mitra
            </span>
            <div className="text-2xl font-extrabold text-white">
              Rp {totalEarnings.toLocaleString('id-ID')}
            </div>
            <p className="text-[10px] text-gray-400">Total akumulasi dari order yang selesai & dibayar.</p>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-blue-500/20 bg-blue-950/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="text-xs text-gray-400 font-semibold flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-blue-400" /> Saldo Dompet OTOVA
            </span>
            <div className="text-2xl font-extrabold text-white">
              Rp {(partner.balance || 0).toLocaleString('id-ID')}
            </div>
            <p className="text-[10px] text-gray-400">Dapat ditarik langsung ke rekening bank terdaftar Anda.</p>
          </div>
          <div>
            <button
              onClick={handleWithdraw}
              disabled={withdrawing || (partner.balance || 0) <= 0}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/25"
            >
              {withdrawing ? 'Menarik...' : '💸 Tarik Saldo'}
            </button>
          </div>
        </div>
      </div>

      {/* Incoming Orders Alert Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Store className="w-4 h-4 text-emerald-400" /> Permintaan Order Masuk Terbaru
          </h2>
          <Link href="/mitra/order-masuk" className="text-xs font-bold text-emerald-400 hover:underline">
            Lihat Semua Order Masuk →
          </Link>
        </div>

        {incomingOrders.length === 0 ? (
          <div className="glass-card p-6 rounded-2xl text-center text-gray-400 text-xs">
            Belum ada order masuk baru saat ini. Pastikan status Anda ONLINE.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {incomingOrders.map((order) => (
              <div
                key={order.id}
                className="glass-card p-5 rounded-2xl border border-emerald-500/40 bg-emerald-950/20 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20">
                      #{order.order_code}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-1">
                      {order.user?.full_name} ({order.vehicle_brand})
                    </h3>
                    <p className="text-xs text-gray-300">{order.complaint}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400">
                    Order Baru
                  </span>
                </div>

                <div className="pt-2 border-t border-gray-800 flex items-center justify-between text-xs">
                  <span className="text-gray-400">
                    Estimasi: <strong className="text-white">Rp {order.total_cost.toLocaleString('id-ID')}</strong>
                  </span>
                  <Link
                    href="/mitra/order-masuk"
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs"
                  >
                    Proses Order
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
