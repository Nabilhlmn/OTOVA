'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Car,
  CalendarCheck,
  Clock,
  Wrench,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  MapPin,
} from 'lucide-react';

export default function UserDashboard() {
  const [user, setUser] = useState<any>(null);
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setUser(data.user);
          // Fetch active orders for this user
          fetch(`/api/orders?user_id=${data.user.id}`)
            .then((r) => r.json())
            .then((oData) => {
              if (oData.success) {
                const active = oData.orders.filter(
                  (o: any) => o.status !== 'ditutup' && o.status !== 'dibatalkan'
                );
                setActiveOrders(active);
              }
              setLoading(false);
            });
        } else {
          setLoading(false);
        }
      });
  }, []);

  if (loading) {
    return <div className="text-center py-16 text-gray-400 text-xs">Memuat dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950/30 to-slate-900 border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">
            Selamat Datang, {user?.full_name || 'Pengguna'}! 👋
          </h1>
          <p className="text-xs text-gray-300 mt-1">
            Butuh bantuan darurat di jalan atau ingin booking servis berkala?
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
          <MapPin className="w-3.5 h-3.5" /> Bandung, Jawa Barat (GPS Aktif)
        </div>
      </div>

      {/* Active Orders Widget */}
      {activeOrders.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400 animate-spin" /> Order Berlangsung ({activeOrders.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {activeOrders.map((order) => (
              <div
                key={order.id}
                className="glass-card p-5 rounded-2xl border-l-4 border-l-emerald-500 hover:border-emerald-400 transition-all space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/20">
                      #{order.order_code}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-1">
                      {order.partner?.business_name}
                    </h3>
                    <p className="text-xs text-gray-400">{order.vehicle_brand} • {order.complaint}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-800 text-xs">
                  <span className="text-gray-400 font-medium">
                    Total Biaya: <strong className="text-white">Rp {order.total_cost.toLocaleString('id-ID')}</strong>
                  </span>
                  <Link
                    href={`/order/${order.id}`}
                    className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1 transition-all"
                  >
                    Pantau Live Tracker <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-4 border border-emerald-500/20 hover:border-emerald-500/40 transition-all group">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Cari Bantuan Darurat</h3>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              Mogok di jalan, ban bocor, atau aki habis? Dapatkan respon cepat montir & tambal ban keliling terdekat via GPS.
            </p>
          </div>
          <Link
            href="/cari-bantuan"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all"
          >
            Minta Bantuan Sekarang <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-4 border border-blue-500/20 hover:border-blue-500/40 transition-all group">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Booking Servis Bengkel</h3>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              Pilih bengkel favorit, atur jadwal jam & tanggal tanpa antre lama. Pembayaran transparan & jaminan kepuasan.
            </p>
          </div>
          <Link
            href="/booking-bengkel"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-lg shadow-blue-500/20 transition-all"
          >
            Cari & Booking Bengkel <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
