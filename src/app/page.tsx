import Link from 'next/link';
import {
  Wrench,
  Car,
  CalendarCheck,
  ShieldCheck,
  MapPin,
  Clock,
  Star,
  ChevronRight,
  Zap,
  PhoneCall,
  UserCheck,
} from 'lucide-react';

export default function Home() {
  return (
    <div className="space-y-16 py-4">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden glass-card p-8 sm:p-12 md:p-16 border border-emerald-500/20 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
            <Zap className="w-4 h-4 animate-bounce" /> Platform Bantuan Darurat Kendaraan #1
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Kendaraan Mogok atau Butuh Servis?{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              Otova Solusinya.
            </span>
          </h1>

          <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
            Hubungkan kendaraan Anda secara instan dengan montir panggilan, tukang tambal ban keliling, dan booking servis bengkel terdekat secara transparan dan terverifikasi.
          </p>

          {/* Quick Action Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <Link
              href="/cari-bantuan"
              className="group p-5 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold shadow-xl shadow-emerald-600/25 transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-white/10 group-hover:scale-110 transition-transform">
                  <Car className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Cari Bantuan Darurat</h3>
                  <p className="text-xs text-emerald-100 font-normal">Mogok, Ban Bocor, Aki Drop</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/booking-bengkel"
              className="group p-5 rounded-2xl glass-card hover:bg-gray-800/80 text-white font-bold border border-gray-700 transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-blue-500/20 group-hover:scale-110 transition-transform">
                  <CalendarCheck className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Booking Servis Bengkel</h3>
                  <p className="text-xs text-gray-400 font-normal">Pilih Bengkel & Jam Terjadwal</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-gray-400" />
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl font-bold text-white">Mengapa Menggunakan OTOVA?</h2>
          <p className="text-xs text-gray-400">
            Didesain khusus untuk keadaan darurat di jalan dan kenyamanan perawatan berkala kendaraan Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-2xl space-y-3 hover:border-emerald-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Deteksi GPS Presisi</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Pencarian mitra terdekat berdasarkan titik koordinat GPS aktual lokasi kendaraan Anda.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-3 hover:border-emerald-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Transparansi Biaya</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Setiap pengajuan perubahan biaya perbaikan atau sparepart tambahan wajib disetujui pengguna lebih dulu.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-3 hover:border-emerald-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <UserCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Mitra Terverifikasi Admin</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Seluruh bengkel, montir freelance, dan tukang tambal ban telah diperiksa identitas KTP & usahanya.
            </p>
          </div>
        </div>
      </section>

      {/* Partner Callout */}
      <section className="glass-card p-8 rounded-3xl bg-gradient-to-r from-gray-900 via-slate-900 to-emerald-950/40 border border-emerald-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-xl font-bold text-white">Anda Pemilik Bengkel / Montir Freelance / Tambal Ban?</h3>
          <p className="text-xs text-gray-300 max-w-xl">
            Bergabunglah sebagai Mitra Otova untuk menjangkau ribuan pemilik kendaraan di sekitar lokasi Anda secara instan.
          </p>
        </div>
        <Link
          href="/register-mitra"
          className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold tracking-wide shadow-lg shadow-emerald-500/20 whitespace-nowrap transition-all"
        >
          Daftar Sebagai Mitra
        </Link>
      </section>
    </div>
  );
}
