'use client';

import { useState, useEffect } from 'react';
import { Store, Star, Search, ShieldBan, ShieldCheck, Eye, ChevronDown } from 'lucide-react';

export default function KelolaMitraPage() {
  const [partners, setPartners] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Suspend modal
  const [suspendTarget, setSuspendTarget] = useState<any>(null);
  const [suspensionReason, setSuspensionReason] = useState('');

  const fetchPartners = () => {
    fetch('/api/partners')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setPartners(data.partners);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const handleStatusChange = async (
    partnerId: string,
    status: 'approved' | 'rejected' | 'suspended' | 'pending',
    reason?: string
  ) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/partners/${partnerId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, suspension_reason: reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengubah status');

      setSuspendTarget(null);
      setSuspensionReason('');
      fetchPartners();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const SUSPEND_REASONS = [
    'Pelanggaran SOP pelayanan pelanggan',
    'Tidak merespons order dalam batas waktu',
    'Keluhan negatif berulang dari pelanggan',
    'Informasi usaha terbukti tidak valid',
    'Penipuan biaya / markup tidak wajar',
    'Aktivitas mencurigakan di platform',
  ];

  const filtered = partners.filter(
    (p) =>
      p.business_name.toLowerCase().includes(search.toLowerCase()) ||
      p.address.toLowerCase().includes(search.toLowerCase())
  );

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      approved: 'bg-emerald-500/20 text-emerald-400',
      rejected: 'bg-rose-500/20 text-rose-400',
      pending: 'bg-amber-500/20 text-amber-400',
      suspended: 'bg-red-600/30 text-red-400 border border-red-600/40',
    };
    return map[status] || 'bg-gray-800 text-gray-400';
  };

  if (loading) return <div className="text-center py-16 text-gray-400 text-xs">Memuat data mitra...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Store className="w-6 h-6 text-purple-400" /> Kelola & Moderasi Mitra
          </h1>
          <p className="text-xs text-gray-400">
            Tinjau seluruh mitra, bekukan akun yang melanggar SOP, atau aktifkan kembali mitra yang telah memenuhi syarat.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama bengkel..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs"
          />
        </div>
      </div>

      {/* Counter Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {['approved', 'pending', 'rejected', 'suspended'].map((s) => {
          const count = partners.filter((p) => p.verification_status === s).length;
          const colorMap: Record<string, string> = {
            approved: 'text-emerald-400',
            pending: 'text-amber-400',
            rejected: 'text-rose-400',
            suspended: 'text-red-400',
          };
          return (
            <div key={s} className="glass-card p-4 rounded-2xl border border-gray-800 text-center">
              <div className={`text-xl font-extrabold ${colorMap[s]}`}>{count}</div>
              <div className="text-[11px] text-gray-400 capitalize font-medium">{s}</div>
            </div>
          );
        })}
      </div>

      {/* Partners Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-gray-900/80 text-gray-400 font-bold uppercase text-[10px] tracking-wider border-b border-gray-800">
              <tr>
                <th className="px-5 py-3.5">Nama Usaha</th>
                <th className="px-5 py-3.5">Jenis</th>
                <th className="px-5 py-3.5">Alamat</th>
                <th className="px-5 py-3.5">Rating</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Online</th>
                <th className="px-5 py-3.5 text-right">Aksi Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {filtered.map((p) => (
                <tr key={p.id} className={`hover:bg-gray-900/40 transition-colors ${p.verification_status === 'suspended' ? 'bg-red-950/10' : ''}`}>
                  <td className="px-5 py-4">
                    <div className="font-bold text-white">{p.business_name}</div>
                    {p.verification_status === 'suspended' && (
                      <div className="text-[10px] text-red-400 mt-0.5 truncate max-w-[160px]">
                        🔴 {p.suspension_reason}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4 uppercase font-semibold text-purple-300">
                    {p.partner_type.replace('_', ' ')}
                  </td>
                  <td className="px-5 py-4 text-gray-400 max-w-xs truncate">{p.address}</td>
                  <td className="px-5 py-4 font-bold text-amber-400">
                    ⭐ {p.rating_average.toFixed(1)}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${statusBadge(p.verification_status)}`}>
                      {p.verification_status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.is_online ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-gray-900 text-gray-500'}`}>
                      {p.is_online ? 'ONLINE' : 'OFFLINE'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 flex-wrap">
                      {/* Tombol Approve (jika bukan approved) */}
                      {p.verification_status !== 'approved' && (
                        <button
                          onClick={() => handleStatusChange(p.id, 'approved')}
                          disabled={actionLoading}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-white font-bold text-[11px] border border-emerald-500/30 transition-all flex items-center gap-1"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" /> Aktifkan
                        </button>
                      )}

                      {/* Tombol Suspend — tampil jika bukan suspended */}
                      {p.verification_status !== 'suspended' && (
                        <button
                          onClick={() => {
                            setSuspendTarget(p);
                            setSuspensionReason('');
                          }}
                          disabled={actionLoading}
                          className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-600 text-red-400 hover:text-white font-bold text-[11px] border border-red-500/30 transition-all flex items-center gap-1"
                        >
                          <ShieldBan className="w-3.5 h-3.5" /> Bekukan
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SUSPEND CONFIRMATION MODAL */}
      {suspendTarget && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card p-6 rounded-3xl max-w-md w-full space-y-5 border-2 border-red-600/40 shadow-2xl shadow-red-900/20">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-red-500/20 shrink-0">
                <ShieldBan className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">Bekukan Akun Mitra</h3>
                <p className="text-xs text-gray-300 mt-0.5">
                  Anda akan membekukan akun:{' '}
                  <strong className="text-red-300">{suspendTarget.business_name}</strong>
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-300">
                Alasan Pembekuan (Pilih atau Isi Manual) <span className="text-red-400">*</span>
              </label>
              {/* Quick reason pills */}
              <div className="flex flex-wrap gap-2 mb-2">
                {SUSPEND_REASONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setSuspensionReason(r)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                      suspensionReason === r
                        ? 'bg-red-600/40 border-red-500 text-red-300'
                        : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <textarea
                value={suspensionReason}
                onChange={(e) => setSuspensionReason(e.target.value)}
                required
                rows={2}
                placeholder="Tulis alasan pembekuan secara spesifik..."
                className="w-full px-4 py-2.5 rounded-xl glass-input text-xs resize-none"
              />
            </div>

            <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/20 text-xs text-red-300 space-y-1">
              <p className="font-bold">⚠️ Efek Pembekuan Akun:</p>
              <ul className="list-disc list-inside text-red-400 space-y-0.5 text-[11px]">
                <li>Mitra tidak dapat menerima order baru</li>
                <li>Status Online otomatis dimatikan</li>
                <li>Notifikasi pembekuan dikirim ke mitra</li>
                <li>Dapat diaktifkan kembali kapan saja oleh Admin</li>
              </ul>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setSuspendTarget(null)}
                className="flex-1 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs transition-all"
              >
                Batal
              </button>
              <button
                onClick={() => handleStatusChange(suspendTarget.id, 'suspended', suspensionReason)}
                disabled={actionLoading || !suspensionReason.trim()}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5"
              >
                <ShieldBan className="w-4 h-4" />
                {actionLoading ? 'Membekukan...' : 'Bekukan Akun Mitra'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
