'use client';

import { useState, useEffect } from 'react';
import {
  Shield,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  User,
  Store,
  Eye,
} from 'lucide-react';

export default function VerifikasiMitraPage() {
  const [partners, setPartners] = useState<any[]>([]);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Selected document modal preview
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

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

  const handleVerification = async (partnerId: string, status: 'approved' | 'rejected') => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/partners/${partnerId}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verification_status: status }),
      });
      
      const text = await res.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch (jsonErr) {
        throw new Error(`Server returned HTML error (HTTP ${res.status}): ${text.substring(0, 160)}`);
      }
      
      if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan pada server');

      fetchPartners();
    } catch (err: any) {
      alert(err.message || 'Gagal mengubah status verifikasi');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredPartners = partners.filter((p) => p.verification_status === filter);

  if (loading) return <div className="text-center py-16 text-gray-400 text-xs">Memuat data mitra...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-purple-400" /> Verifikasi Dokumen & Identitas Mitra
          </h1>
          <p className="text-xs text-gray-400">
            Periksa foto KTP, foto usaha, dan legalitas sebelum menyetujui akun mitra Otova.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-gray-900 border border-gray-800">
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === 'pending'
                ? 'bg-amber-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Pending ({partners.filter((p) => p.verification_status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === 'approved'
                ? 'bg-emerald-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Approved ({partners.filter((p) => p.verification_status === 'approved').length})
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === 'rejected'
                ? 'bg-rose-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Rejected ({partners.filter((p) => p.verification_status === 'rejected').length})
          </button>
        </div>
      </div>

      {filteredPartners.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl text-center text-gray-400 text-xs">
          Tidak ada data mitra pada status ini.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPartners.map((partner) => (
            <div
              key={partner.id}
              className="glass-card p-6 rounded-2xl border border-gray-800 space-y-4"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-gray-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-950 text-purple-300 border border-purple-500/30">
                      {partner.partner_type.replace('_', ' ')}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        partner.verification_status === 'approved'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : partner.verification_status === 'rejected'
                          ? 'bg-rose-500/20 text-rose-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {partner.verification_status}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-white">{partner.business_name}</h2>
                  <p className="text-xs text-gray-400">{partner.address}</p>
                </div>

                <div className="text-xs text-gray-400">
                  Pemilik: <strong className="text-white">{partner.user?.full_name}</strong> •{' '}
                  {partner.user?.email}
                </div>
              </div>

              {/* Document Images Preview Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-gray-900 border border-gray-800 space-y-2">
                  <span className="text-[11px] font-bold text-gray-300 block">Foto KTP Pemilik</span>
                  <div className="relative h-28 rounded-lg overflow-hidden bg-gray-950 group">
                    <img
                      src={partner.ktp_photo || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80'}
                      alt="KTP"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() =>
                        setSelectedPhoto(
                          partner.ktp_photo ||
                            'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80'
                        )
                      }
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity"
                    >
                      <Eye className="w-4 h-4 mr-1" /> Lihat Dokumen
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-gray-900 border border-gray-800 space-y-2">
                  <span className="text-[11px] font-bold text-gray-300 block">Foto Usaha / Tempat</span>
                  <div className="relative h-28 rounded-lg overflow-hidden bg-gray-950 group">
                    <img
                      src={partner.business_photo || 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=400&auto=format&fit=crop&q=80'}
                      alt="Usaha"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() =>
                        setSelectedPhoto(
                          partner.business_photo ||
                            'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=800&auto=format&fit=crop&q=80'
                        )
                      }
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity"
                    >
                      <Eye className="w-4 h-4 mr-1" /> Lihat Foto Usaha
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-gray-800 flex items-center gap-3">
                <button
                  onClick={() => handleVerification(partner.id, 'approved')}
                  disabled={actionLoading || partner.verification_status === 'approved'}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
                >
                  <CheckCircle2 className="w-4 h-4" /> Setujui Verifikasi (Approve)
                </button>

                <button
                  onClick={() => handleVerification(partner.id, 'rejected')}
                  disabled={actionLoading || partner.verification_status === 'rejected'}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <XCircle className="w-4 h-4" /> Tolak Pendaftaran (Reject)
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PHOTO PREVIEW MODAL */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="glass-card p-4 rounded-3xl max-w-2xl w-full space-y-3 border border-purple-500/30">
            <div className="flex items-center justify-between text-xs font-bold text-white">
              <span>Preview Dokumen Identitas</span>
              <span>Klik di mana saja untuk menutup</span>
            </div>
            <img src={selectedPhoto} alt="Preview Dokumen" className="w-full max-h-[70vh] object-contain rounded-xl" />
          </div>
        </div>
      )}
    </div>
  );
}
