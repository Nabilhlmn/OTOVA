'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CalendarCheck, Star, MapPin, Search, ChevronRight, Wrench } from 'lucide-react';

export default function BookingBengkelListPage() {
  const [bengkels, setBengkels] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/partners?type=bengkel&status=approved&near=-6.917464,107.619123')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setBengkels(data.partners);
        }
        setLoading(false);
      });
  }, []);

  const filtered = bengkels.filter((b) =>
    b.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-blue-400" /> Booking Bengkel Terpercaya
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Pilih bengkel resmi/umum terverifikasi untuk perawatan rutin & servis terjadwal.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama bengkel..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400 text-xs">Memuat daftar bengkel...</div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl text-center text-gray-400 text-xs">
          Tidak ditemukan bengkel yang cocok.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((bengkel) => (
            <div
              key={bengkel.id}
              className="glass-card rounded-2xl overflow-hidden border border-gray-800 hover:border-blue-500/40 transition-all flex flex-col justify-between group"
            >
              {/* Photo Banner */}
              <div className="relative h-44 w-full bg-gray-900 overflow-hidden">
                <img
                  src={bengkel.business_photo || 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=800&auto=format&fit=crop&q=80'}
                  alt={bengkel.business_name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur text-amber-400 text-xs font-bold flex items-center gap-1 border border-amber-500/20">
                  <Star className="w-3.5 h-3.5 fill-amber-400" /> {bengkel.rating_average.toFixed(1)}
                </div>
              </div>

              {/* Content */}
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-white line-clamp-1">
                    {bengkel.business_name}
                  </h3>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="line-clamp-1">{bengkel.address}</span>
                  </p>
                  {bengkel.services && (
                    <p className="text-[11px] text-gray-400 line-clamp-2 pt-1">
                      Layanan: {bengkel.services}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-800 flex items-center justify-between">
                  <span className="text-xs text-emerald-400 font-semibold">
                    {bengkel.distance_km || 1.2} km dari Anda
                  </span>
                  <Link
                    href={`/booking-bengkel/${bengkel.id}`}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 transition-all"
                  >
                    Booking Slot <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
