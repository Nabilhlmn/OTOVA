'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Shield,
  UserCheck,
  Store,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  FileCheck,
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPartners: 0,
    pendingPartners: 0,
    totalOrders: 0,
  });
  const [pendingList, setPendingList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch pending partners
    fetch('/api/partners?status=pending')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPendingList(data.partners);
          setStats((prev) => ({
            ...prev,
            pendingPartners: data.partners.length,
          }));
        }
      });

    // Fetch all partners
    fetch('/api/partners')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStats((prev) => ({
            ...prev,
            totalPartners: data.partners.length,
          }));
        }
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center py-16 text-gray-400 text-xs">Memuat admin control center...</div>;

  return (
    <div className="space-y-6 py-4">
      {/* Header Banner */}
      <div className="glass-card p-6 rounded-3xl bg-gradient-to-r from-slate-950 via-purple-950/30 to-slate-950 border border-purple-500/20 flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-[11px] font-bold mb-2">
            <Shield className="w-3.5 h-3.5" /> Administrator Control Center
          </div>
          <h1 className="text-2xl font-extrabold text-white">Dashboard Monitoring OTOVA</h1>
          <p className="text-xs text-gray-300">
            Pusat verifikasi dokumen mitra, monitoring order, dan tata kelola akun platform.
          </p>
        </div>
      </div>

      {/* Counter Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-gray-800 space-y-1">
          <span className="text-xs text-gray-400 font-semibold flex items-center gap-1.5">
            <Store className="w-4 h-4 text-purple-400" /> Total Mitra Terdaftar
          </span>
          <div className="text-2xl font-extrabold text-white">{stats.totalPartners}</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-amber-500/40 bg-amber-950/10 space-y-1">
          <span className="text-xs text-amber-400 font-semibold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" /> Mitra Menunggu Verifikasi
          </span>
          <div className="text-2xl font-extrabold text-amber-400">{stats.pendingPartners}</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-gray-800 space-y-1">
          <span className="text-xs text-gray-400 font-semibold flex items-center gap-1.5">
            <FileCheck className="w-4 h-4 text-emerald-400" /> Status Sistem
          </span>
          <div className="text-sm font-bold text-emerald-400 pt-1">ONLINE & OPTIMAL</div>
        </div>
      </div>

      {/* Pending Verifications Quick Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" /> Permohonan Verifikasi Mitra ({pendingList.length})
          </h2>
          <Link
            href="/admin/verifikasi-mitra"
            className="text-xs font-bold text-purple-400 hover:underline"
          >
            Buka Halaman Verifikasi →
          </Link>
        </div>

        {pendingList.length === 0 ? (
          <div className="glass-card p-6 rounded-2xl text-center text-gray-400 text-xs">
            Tidak ada permohonan mitra pending saat ini. Semua mitra terverifikasi.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingList.map((p) => (
              <div
                key={p.id}
                className="glass-card p-5 rounded-2xl border border-amber-500/30 bg-amber-950/10 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-400">
                      {p.partner_type.replace('_', ' ')}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-1">{p.business_name}</h3>
                    <p className="text-xs text-gray-400">{p.address}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-800 flex items-center justify-between">
                  <span className="text-[11px] text-gray-400">
                    KTP & Usaha Terlampir
                  </span>
                  <Link
                    href="/admin/verifikasi-mitra"
                    className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs"
                  >
                    Tinjau Dokumen
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
