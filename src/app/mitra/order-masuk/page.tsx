'use client';

import { useState, useEffect } from 'react';
import {
  Store,
  Check,
  X,
  Phone,
  PlusCircle,
} from 'lucide-react';

export default function MitraOrderMasukPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [partner, setPartner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Cost change modal states
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [additionalCost, setAdditionalCost] = useState('');
  const [costReason, setCostReason] = useState('');

  const fetchMitraOrders = () => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user.partner) {
          setPartner(data.user.partner);
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
    fetchMitraOrders();
    const interval = setInterval(fetchMitraOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const updateOrderStatus = async (orderId: string, status: string) => {
    setActionLoading(true);
    try {
      await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      fetchMitraOrders();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCostChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/orders/${selectedOrderId}/cost-change`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          additional_cost: Number(additionalCost),
          reason: costReason,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSelectedOrderId(null);
      setAdditionalCost('');
      setCostReason('');
      fetchMitraOrders();
    } catch (err: any) {
      alert(err.message || 'Gagal mengajukan biaya tambahan');
    } finally {
      setActionLoading(false);
    }
  };

  const hasActiveOrder = partner?.partner_type === 'teknisi' && orders.some(
    (o) => ['diterima', 'menuju_lokasi', 'tiba', 'inspeksi', 'menunggu_persetujuan_biaya', 'sedang_dikerjakan'].includes(o.status)
  );

  if (loading) return <div className="text-center py-16 text-gray-400 text-xs">Memuat order masuk...</div>;

  // Sort: menunggu_mitra first, then active, then done
  const sorted = [...orders].sort((a, b) => {
    const priority: Record<string, number> = { menunggu_mitra: 0, diterima: 1, menuju_lokasi: 2, tiba: 3, inspeksi: 4, sedang_dikerjakan: 5, selesai: 6 };
    return (priority[a.status] ?? 9) - (priority[b.status] ?? 9);
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <Store className="w-6 h-6 text-emerald-400" /> Penanganan Order Masuk & Pekerjaan
        </h1>
        <p className="text-xs text-gray-400">
          Kelola penerimaan order dan perbarui tahapan status perbaikan kendaraan pelanggan.
        </p>
      </div>

      {sorted.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl text-center text-gray-400 text-xs">
          Belum ada order masuk untuk akun mitra Anda saat ini.
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map((order) => {
            const isDone = ['dibayar', 'ditutup', 'dibatalkan'].includes(order.status);
            return (
              <div
                key={order.id}
                className={`glass-card p-6 rounded-2xl border space-y-4 ${
                  order.status === 'menunggu_mitra'
                    ? 'border-emerald-500/50 bg-emerald-950/10'
                    : isDone
                    ? 'border-gray-800/40 opacity-60'
                    : 'border-gray-800'
                }`}
              >
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-gray-800">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20">
                        #{order.order_code}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-gray-900 text-emerald-400 border border-emerald-500/20">
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white">
                      {order.user?.full_name} — {order.vehicle_brand}
                    </h3>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" /> {order.user?.phone_number || '-'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-white">
                      Rp {order.total_cost.toLocaleString('id-ID')}
                    </span>
                    {order.additional_cost && (
                      <span className="text-[10px] text-amber-400 block">
                        +Rp {order.additional_cost.toLocaleString('id-ID')} ({order.cost_change_status})
                      </span>
                    )}
                  </div>
                </div>

                {/* Keluhan */}
                <div className="text-xs">
                  <span className="text-gray-400 font-medium block mb-1">Keluhan / Layanan:</span>
                  <p className="text-gray-200 bg-gray-900/60 p-3 rounded-xl border border-gray-800">
                    {order.complaint}
                  </p>
                </div>

                {/* ACTION BUTTONS PER STATUS */}
                {!isDone && (
                  <div className="pt-2 border-t border-gray-800 flex flex-wrap gap-2">
                    {order.status === 'menunggu_mitra' && (
                      <>
                        <button
                          onClick={() => updateOrderStatus(order.id, 'diterima')}
                          disabled={actionLoading || hasActiveOrder}
                          className={`px-4 py-2 rounded-xl text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md ${
                            hasActiveOrder
                              ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700/60 shadow-none'
                              : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20'
                          }`}
                          title={hasActiveOrder ? 'Selesaikan order aktif Anda terlebih dahulu' : undefined}
                        >
                          <Check className="w-4 h-4" /> Terima Order
                        </button>
                        <button
                          onClick={() => updateOrderStatus(order.id, 'dibatalkan')}
                          disabled={actionLoading}
                          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
                        >
                          <X className="w-4 h-4" /> Tolak Order
                        </button>
                        {hasActiveOrder && (
                          <span className="text-[11px] text-amber-400 font-semibold self-center">
                            ⚠️ Selesaikan order aktif Anda dulu
                          </span>
                        )}
                      </>
                    )}

                    {order.status === 'diterima' && (
                      <button onClick={() => updateOrderStatus(order.id, 'menuju_lokasi')} disabled={actionLoading}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all">
                        🚗 Menuju Lokasi
                      </button>
                    )}

                    {order.status === 'menuju_lokasi' && (
                      <button onClick={() => updateOrderStatus(order.id, 'tiba')} disabled={actionLoading}
                        className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-all">
                        📍 Tiba di Lokasi
                      </button>
                    )}

                    {order.status === 'tiba' && (
                      <button onClick={() => updateOrderStatus(order.id, 'inspeksi')} disabled={actionLoading}
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-all">
                        🔍 Mulai Inspeksi
                      </button>
                    )}

                    {order.status === 'inspeksi' && (
                      <>
                        <button onClick={() => updateOrderStatus(order.id, 'sedang_dikerjakan')} disabled={actionLoading}
                          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-all">
                          🛠️ Kerjakan (Tanpa Biaya Tambahan)
                        </button>
                        <button onClick={() => setSelectedOrderId(order.id)} disabled={actionLoading}
                          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 transition-all">
                          <PlusCircle className="w-4 h-4" /> Ajukan Biaya Tambahan
                        </button>
                      </>
                    )}

                    {order.status === 'sedang_dikerjakan' && (
                      <button onClick={() => updateOrderStatus(order.id, 'selesai')} disabled={actionLoading}
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-all">
                        ✅ Pekerjaan Selesai
                      </button>
                    )}

                    {order.status === 'menunggu_persetujuan_biaya' && (
                      <span className="text-xs text-amber-400 font-bold py-2">
                        ⏳ Menunggu persetujuan biaya tambahan dari user...
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* COST CHANGE MODAL */}
      {selectedOrderId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCostChangeSubmit}
            className="glass-card p-6 rounded-3xl max-w-md w-full space-y-4 border border-amber-500/30"
          >
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-amber-400" /> Ajukan Penyesuaian Biaya
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">Biaya Penyesuaian (+/- Rp)</label>
              <input
                type="number"
                value={additionalCost}
                onChange={(e) => setAdditionalCost(e.target.value)}
                required
                placeholder="Contoh: 50000 (tambahan) atau -20000 (diskon)"
                className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">Alasan / Detail Sparepart</label>
              <textarea
                value={costReason}
                onChange={(e) => setCostReason(e.target.value)}
                required
                rows={2}
                placeholder="Contoh: Perlu penggantian oli gardan & kampas rem belakang"
                className="w-full px-4 py-2.5 rounded-xl glass-input text-xs resize-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button type="button" onClick={() => setSelectedOrderId(null)}
                className="flex-1 py-2.5 rounded-xl bg-gray-800 text-gray-300 font-bold text-xs">
                Batal
              </button>
              <button type="submit" disabled={actionLoading}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs">
                {actionLoading ? 'Mengirim...' : 'Kirim Pengajuan'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
