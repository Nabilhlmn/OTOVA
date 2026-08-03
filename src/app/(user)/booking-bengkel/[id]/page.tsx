'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  CalendarCheck,
  Star,
  MapPin,
  Clock,
  Wrench,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';

export default function BookingBengkelDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [bengkel, setBengkel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [vehicleType, setVehicleType] = useState<'motor' | 'mobil'>('mobil');
  const [vehicleBrand, setVehicleBrand] = useState('');
  const [serviceType, setServiceType] = useState('Servis Berkala & Ganti Oli');
  const [bookingDate, setBookingDate] = useState('2026-08-05');
  const [bookingTime, setBookingTime] = useState('10:00');
  const [complaint, setComplaint] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/partners/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setBengkel(data.partner);
        setLoading(false);
      });
  }, [params.id]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partner_id: params.id,
          order_type: 'booking_bengkel',
          vehicle_type: vehicleType,
          vehicle_brand: vehicleBrand,
          complaint: complaint || serviceType,
          booking_date: bookingDate,
          booking_time: bookingTime,
          service_type: serviceType,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengirimkan booking');

      router.push(`/order/${data.order.id}`);
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-16 text-gray-400 text-xs">Memuat detail bengkel...</div>;
  if (!bengkel) return <div className="text-center py-16 text-gray-400 text-xs">Bengkel tidak ditemukan.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4">
      {/* Bengkel Header Info */}
      <div className="glass-card rounded-3xl overflow-hidden border border-gray-800">
        <div className="relative h-56 w-full bg-gray-900">
          <img
            src={bengkel.business_photo || 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=800&auto=format&fit=crop&q=80'}
            alt={bengkel.business_name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent"></div>
          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl font-extrabold text-white">{bengkel.business_name}</h1>
              <p className="text-xs text-gray-300 flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" /> {bengkel.address}
              </p>
            </div>
            <div className="px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-400" /> {bengkel.rating_average.toFixed(1)} (
              {bengkel.reviews?.length || 0} Ulasan)
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Services & Reviews Info */}
        <div className="md:col-span-5 space-y-4">
          <div className="glass-card p-5 rounded-2xl space-y-3 border border-gray-800">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Wrench className="w-4 h-4" /> Layanan Bengkel
            </h2>
            <p className="text-xs text-gray-300 leading-relaxed">
              {bengkel.services || 'Servis Berkala, Tune Up, Ganti Oli, Rem, Kelistrikan'}
            </p>
          </div>

          <div className="glass-card p-5 rounded-2xl space-y-3 border border-gray-800">
            <h2 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Star className="w-4 h-4" /> Ulasan Pelanggan
            </h2>

            {bengkel.reviews?.length === 0 ? (
              <p className="text-xs text-gray-500">Belum ada ulasan untuk bengkel ini.</p>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {bengkel.reviews?.map((r: any) => (
                  <div key={r.id} className="p-3 rounded-xl bg-gray-900/60 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-200">{r.user?.full_name}</span>
                      <span className="text-amber-400 font-bold flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-amber-400" /> {r.rating}
                      </span>
                    </div>
                    <p className="text-gray-400 text-[11px]">{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Booking Form */}
        <form onSubmit={handleBooking} className="md:col-span-7 glass-card p-6 rounded-2xl space-y-4 border border-gray-800">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-blue-400" /> Form Jadwal Booking
          </h2>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">Jenis Kendaraan</label>
              <select
                value={vehicleType}
                onChange={(e: any) => setVehicleType(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
              >
                <option value="mobil">🚗 Mobil</option>
                <option value="motor">🛵 Sepeda Motor</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">Merek Kendaraan</label>
              <input
                type="text"
                value={vehicleBrand}
                onChange={(e) => setVehicleBrand(e.target.value)}
                required
                placeholder="Avanza 2021 / Honda Vario"
                className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">Pilih Tanggal Booking</label>
              <input
                type="date"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">Jam Kedatangan</label>
              <select
                value={bookingTime}
                onChange={(e) => setBookingTime(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
              >
                <option value="09:00">09:00 WIB</option>
                <option value="10:00">10:00 WIB</option>
                <option value="11:00">11:00 WIB</option>
                <option value="13:00">13:00 WIB</option>
                <option value="14:00">14:00 WIB</option>
                <option value="15:00">15:00 WIB</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">Layanan yang Dipilih</label>
            <input
              type="text"
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">Catatan / Keluhan (Opsional)</label>
            <textarea
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
              rows={2}
              placeholder="Catatan tambahan untuk montir bengkel"
              className="w-full px-4 py-2.5 rounded-xl glass-input text-xs resize-none"
            />
          </div>

          {/* Dynamic Price Estimate Preview */}
          <div className="p-3.5 rounded-xl bg-blue-950/20 border border-blue-500/30 space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-blue-400">
              <span>Estimasi Biaya Servis</span>
              <span className="text-sm">
                Rp{' '}
                {(
                  (vehicleType === 'mobil' ? 120000 : 60000) +
                  (`${serviceType} ${complaint}`.toLowerCase().includes('ban') || `${serviceType} ${complaint}`.toLowerCase().includes('bocor')
                    ? vehicleType === 'mobil' ? 35000 : 15000
                    : `${serviceType} ${complaint}`.toLowerCase().includes('aki') || `${serviceType} ${complaint}`.toLowerCase().includes('jumper')
                    ? vehicleType === 'mobil' ? 50000 : 25000
                    : `${serviceType} ${complaint}`.toLowerCase().includes('oli') || `${serviceType} ${complaint}`.toLowerCase().includes('servis')
                    ? vehicleType === 'mobil' ? 90000 : 40000
                    : `${serviceType} ${complaint}`.toLowerCase().includes('mesin') || `${serviceType} ${complaint}`.toLowerCase().includes('mogok')
                    ? vehicleType === 'mobil' ? 70000 : 30000
                    : 0)
                ).toLocaleString('id-ID')}
              </span>
            </div>
            <p className="text-[10px] text-gray-400">
              *Estimasi awal slot booking {vehicleType}. Biaya aktual ditentukan setelah pemeriksaan oleh teknisi bengkel.
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
          >
            {submitting ? 'Mengirim Booking...' : 'Kirim Pemesanan Slot Booking'}
          </button>
        </form>
      </div>
    </div>
  );
}
