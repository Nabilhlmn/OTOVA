'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Car,
  MapPin,
  Camera,
  Star,
  Wrench,
  Search,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

export default function CariBantuanPage() {
  const router = useRouter();
  const [vehicleType, setVehicleType] = useState<'motor' | 'mobil'>('motor');
  const [vehicleBrand, setVehicleBrand] = useState('');
  const [complaint, setComplaint] = useState('');
  const [userLocation, setUserLocation] = useState({ lat: -6.917464, lng: 107.619123 });
  const [locating, setLocating] = useState(false);
  const [partners, setPartners] = useState<any[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<any>(null);
  const [loadingPartners, setLoadingPartners] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch partners near current location
  const fetchNearbyPartners = () => {
    setLoadingPartners(true);
    fetch(`/api/partners?status=approved&onlineOnly=true&near=${userLocation.lat},${userLocation.lng}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPartners(data.partners);
        }
        setLoadingPartners(false);
      })
      .catch(() => setLoadingPartners(false));
  };

  useEffect(() => {
    fetchNearbyPartners();
  }, [userLocation]);

  const handleGetGPS = () => {
    setLocating(true);
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        alert("GPS / Layanan Lokasi hanya diizinkan melalui koneksi aman (HTTPS). Mohon akses halaman OTOVA menggunakan protokol HTTPS.");
        setLocating(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocating(false);
        },
        (err) => {
          setLocating(false);
          let errMsg = "Akses lokasi gagal: ";
          if (err.code === err.PERMISSION_DENIED) {
            errMsg += "Izin akses GPS dinonaktifkan di kustomisasi peramban Anda. Silakan aktifkan izin lokasi di peramban.";
          } else if (err.code === err.POSITION_UNAVAILABLE) {
            errMsg += "Informasi posisi GPS tidak terdeteksi.";
          } else if (err.code === err.TIMEOUT) {
            errMsg += "Waktu request lokasi GPS habis.";
          } else {
            errMsg += err.message;
          }
          alert(errMsg);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      alert("Fitur GPS / Geolocation tidak didukung oleh browser Anda.");
      setLocating(false);
    }
  };

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partner_id: selectedPartner ? selectedPartner.id : null,
          order_type: 'cari_bantuan',
          vehicle_type: vehicleType,
          vehicle_brand: vehicleBrand,
          complaint,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengirim order');

      router.push(`/order/${data.order.id}`);
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <Car className="w-6 h-6 text-emerald-400" /> Cari Bantuan Darurat Kendaraan
        </h1>
        <p className="text-xs text-gray-400">
          Isi detail keluhan & kendaraan Anda untuk menemukan montir dan tukang tambal ban terdekat.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Form Column */}
        <form onSubmit={handleOrder} className="md:col-span-6 space-y-4 glass-card p-6 rounded-2xl border border-gray-800">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
              {error}
            </div>
          )}

          {/* Vehicle Type Switch */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">Jenis Kendaraan</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setVehicleType('motor')}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all ${
                  vehicleType === 'motor'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                    : 'bg-gray-900 border-gray-800 text-gray-400'
                }`}
              >
                🛵 Sepeda Motor
              </button>
              <button
                type="button"
                onClick={() => setVehicleType('mobil')}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition-all ${
                  vehicleType === 'mobil'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                    : 'bg-gray-900 border-gray-800 text-gray-400'
                }`}
              >
                🚗 Mobil
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">Merek & Tipe Kendaraan</label>
            <input
              type="text"
              value={vehicleBrand}
              onChange={(e) => setVehicleBrand(e.target.value)}
              required
              placeholder="Contoh: Honda Vario 150 / Toyota Avanza 2020"
              className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
            />
          </div>

          {/* Dynamic Services Selector from Selected Partner */}
          {selectedPartner && (
            <div className="space-y-1.5 p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
              <label className="text-xs font-bold text-emerald-400 flex items-center justify-between">
                <span>Pilihan Paket Layanan ({selectedPartner.business_name})</span>
              </label>

              {(() => {
                let servicesArr: any[] = [];
                if (selectedPartner.services) {
                  try {
                    const parsed = JSON.parse(selectedPartner.services);
                    if (Array.isArray(parsed)) servicesArr = parsed;
                  } catch {
                    servicesArr = [];
                  }
                }

                if (servicesArr.length === 0) {
                  return (
                    <p className="text-[10px] text-gray-400 italic">
                      Mitra ini menggunakan estimasi tarif umum dasar.
                    </p>
                  );
                }

                return (
                  <select
                    onChange={(e) => {
                      const selectedService = servicesArr.find((s) => s.id === e.target.value);
                      if (selectedService) {
                        setComplaint(`${selectedService.name} (Rp ${selectedService.price.toLocaleString('id-ID')})`);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl glass-input text-xs"
                  >
                    <option value="">-- Pilih Paket Layanan Spesifik Mitra --</option>
                    {servicesArr.map((s: any) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.vehicle === 'semua' ? 'Motor/Mobil' : s.vehicle}) - Rp{' '}
                        {s.price.toLocaleString('id-ID')}
                      </option>
                    ))}
                  </select>
                );
              })()}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">Keluhan Kendaraan</label>
            <textarea
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
              required
              rows={3}
              placeholder="Jelaskan kondisi mogok/kerusakan (misal: mesin mati di jalan, ban belakang bocor)"
              className="w-full px-4 py-2.5 rounded-xl glass-input text-xs resize-none"
            />
          </div>

          {/* GPS Location simulation button */}
          <div className="p-3 rounded-xl bg-gray-900/80 border border-gray-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-400" /> Lokasi GPS Anda
              </span>
              <button
                type="button"
                onClick={handleGetGPS}
                className="text-[11px] font-bold text-emerald-400 hover:underline"
              >
                {locating ? 'Mendeteksi...' : 'Perbarui Lokasi GPS'}
              </button>
            </div>
            <p className="text-[11px] text-gray-400">
              Koordinat: {userLocation.lat.toFixed(5)}, {userLocation.lng.toFixed(5)} (Bandung)
            </p>
          </div>

          {/* Dynamic Price Estimate Preview */}
          <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
              <span>Estimasi Biaya Awal</span>
              <span className="text-sm">
                Rp{' '}
                {(
                  (selectedPartner
                    ? vehicleType === 'mobil'
                      ? (selectedPartner.base_price_mobil || 75000)
                      : (selectedPartner.base_price_motor || 35000)
                    : vehicleType === 'mobil' ? 75000 : 35000) +
                  (complaint.toLowerCase().includes('ban') || complaint.toLowerCase().includes('bocor')
                    ? vehicleType === 'mobil' ? 35000 : 15000
                    : complaint.toLowerCase().includes('aki') || complaint.toLowerCase().includes('jumper')
                    ? vehicleType === 'mobil' ? 50000 : 25000
                    : complaint.toLowerCase().includes('oli') || complaint.toLowerCase().includes('servis')
                    ? vehicleType === 'mobil' ? 90000 : 40000
                    : complaint.toLowerCase().includes('mesin') || complaint.toLowerCase().includes('mogok')
                    ? vehicleType === 'mobil' ? 70000 : 30000
                    : 0)
                ).toLocaleString('id-ID')}
              </span>
            </div>
            <p className="text-[10px] text-gray-400">
              *Tarif dasar ditentukan oleh {selectedPartner ? selectedPartner.business_name : 'Mitra'} ({vehicleType}). Biaya final dapat disesuaikan jika ada ganti sparepart.
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-emerald-500/20 hover:from-emerald-600 hover:to-teal-700"
          >
            {submitting ? (
              'Mengirim Order...'
            ) : selectedPartner ? (
              <>
                Kirim Order ke {selectedPartner.business_name} <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                🚨 Minta Bantuan Darurat Sekarang <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Partner Selection Column */}
        <div className="md:col-span-6 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Daftar Mitra Online Terdekat ({partners.length}) - Opsional
          </h2>

          {loadingPartners ? (
            <div className="text-center py-12 text-gray-400 text-xs">Mencari mitra terdekat...</div>
          ) : partners.length === 0 ? (
            <div className="glass-card p-6 rounded-2xl text-center text-gray-400 text-xs">
              Belum ada mitra online di lokasi ini.
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {partners.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedPartner(p)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                    selectedPartner?.id === p.id
                      ? 'bg-emerald-950/40 border-emerald-500 shadow-lg shadow-emerald-500/10'
                      : 'glass-card border-gray-800 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-gray-800 text-emerald-400">
                        {p.partner_type.replace('_', ' ')}
                      </span>
                      <h3 className="text-sm font-bold text-white">{p.business_name}</h3>
                      <p className="text-xs text-gray-400 leading-tight">{p.address}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" /> {p.rating_average.toFixed(1)}
                      </div>
                      <span className="text-[11px] text-emerald-400 font-semibold mt-1 block">
                        {p.distance_km} km
                      </span>
                    </div>
                  </div>

                  {p.services && (
                    <p className="text-[11px] text-gray-400 mt-2 pt-2 border-t border-gray-800/60 line-clamp-1">
                      Layanan: {p.services}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
