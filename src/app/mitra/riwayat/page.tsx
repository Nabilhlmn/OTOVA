'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, ChevronRight } from 'lucide-react';

export default function MitraRiwayatPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user.partner) {
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
  }, []);

  const completed = orders.filter((o) =>
    ['dibayar', 'ditutup', 'dibatalkan', 'selesai'].includes(o.status)
  );

  if (loading) return <div className="text-center py-16 text-gray-400 text-xs">Memuat riwayat...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4">
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <Clock className="w-6 h-6 text-emerald-400" /> Riwayat Order Mitra
        </h1>
        <p className="text-xs text-gray-400">Seluruh order yang sudah selesai atau dibatalkan.</p>
      </div>

      {completed.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl text-center text-gray-400 text-xs">
          Belum ada riwayat order yang selesai.
        </div>
      ) : (
        <div className="space-y-3">
          {completed.map((order) => (
            <div key={order.id} className="glass-card p-5 rounded-2xl border border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/20">
                  #{order.order_code}
                </span>
                <h3 className="text-sm font-bold text-white">
                  {order.user?.full_name} — {order.vehicle_brand}
                </h3>
                <p className="text-xs text-gray-400 line-clamp-1">{order.complaint}</p>
              </div>
              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-800">
                <div className="text-right">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase block ${
                    order.status === 'dibatalkan' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {order.status.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs font-bold text-white block mt-1">
                    Rp {order.total_cost.toLocaleString('id-ID')}
                  </span>
                </div>
                <Link href={`/order/${order.id}`}
                  className="p-2.5 rounded-xl bg-gray-800 hover:bg-emerald-500 text-gray-300 hover:text-white transition-all">
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
