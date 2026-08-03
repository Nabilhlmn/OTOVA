'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';

export default function UserRiwayatPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState<'semua' | 'aktif' | 'selesai'>('semua');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          fetch(`/api/orders?user_id=${data.user.id}`)
            .then((r) => r.json())
            .then((oData) => {
              if (oData.success) setOrders(oData.orders);
              setLoading(false);
            });
        } else {
          setLoading(false);
        }
      });
  }, []);

  const filteredOrders = orders.filter((o) => {
    if (filter === 'aktif') return o.status !== 'ditutup' && o.status !== 'dibatalkan';
    if (filter === 'selesai') return o.status === 'ditutup' || o.status === 'selesai' || o.status === 'dibayar';
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Clock className="w-6 h-6 text-emerald-400" /> Riwayat Order & Servis
          </h1>
          <p className="text-xs text-gray-400">
            Daftar seluruh transaksi perbaikan darurat & booking bengkel Anda.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-gray-900 border border-gray-800">
          <button
            onClick={() => setFilter('semua')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === 'semua' ? 'bg-emerald-500 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setFilter('aktif')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === 'aktif' ? 'bg-emerald-500 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Aktif
          </button>
          <button
            onClick={() => setFilter('selesai')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === 'selesai' ? 'bg-emerald-500 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            Selesai
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400 text-xs">Memuat riwayat order...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl text-center text-gray-400 text-xs">
          Belum ada riwayat order pada kategori ini.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="glass-card p-5 rounded-2xl border border-gray-800 hover:border-emerald-500/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/20">
                    #{order.order_code}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {new Date(order.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white">
                  {order.partner?.business_name} ({order.order_type === 'cari_bantuan' ? 'Cari Bantuan' : 'Booking Bengkel'})
                </h3>
                <p className="text-xs text-gray-400">{order.vehicle_brand} • {order.complaint}</p>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-800">
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-gray-900 text-emerald-400 border border-emerald-500/20 block">
                    {order.status.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs font-bold text-white block mt-1">
                    Rp {order.total_cost.toLocaleString('id-ID')}
                  </span>
                </div>

                <Link
                  href={`/order/${order.id}`}
                  className="p-2.5 rounded-xl bg-gray-800 hover:bg-emerald-500 text-gray-300 hover:text-white transition-all"
                  title="Detail Live Tracker"
                >
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
