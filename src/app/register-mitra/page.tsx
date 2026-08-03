'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Store,
  MapPin,
  Camera,
  Plus,
  Trash2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export default function RegisterMitraPage() {
  const router = useRouter();
  const [loadingUser, setLoadingUser] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Form states
  const [businessName, setBusinessName] = useState('');
  const [partnerType, setPartnerType] = useState('bengkel');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState(-6.917464);
  const [longitude, setLongitude] = useState(107.619123);
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [locationName, setLocationName] = useState('Bandung (Default)');

  // File Upload States
  const [ktpPhoto, setKtpPhoto] = useState('/uploads/ktp_default.jpg');
  const [businessPhoto, setBusinessPhoto] = useState('https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=800&auto=format&fit=crop&q=80');
  const [ktpUploading, setKtpUploading] = useState(false);
  const [businessUploading, setBusinessUploading] = useState(false);

  // Custom services list state
  const [services, setServices] = useState<any[]>([]);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceVehicle, setNewServiceVehicle] = useState<'motor' | 'mobil' | 'semua'>('semua');

  // Verify auth session on mount
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated) {
          router.push('/login');
        } else if (data.user?.partner) {
          // If already has partner profile, direct straight to dashboard
          router.push('/mitra/dashboard');
        } else {
          setUser(data.user);
          setLoadingUser(false);
        }
      })
      .catch(() => {
        router.push('/login');
      });
  }, [router]);

  const handleGetGPS = () => {
    setLocating(true);
    setError('');

    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      // Check if accessed over non-secure HTTP (except localhost)
      if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        alert("GPS / Layanan Lokasi hanya diizinkan melalui koneksi aman (HTTPS). Mohon akses halaman OTOVA menggunakan protokol HTTPS.");
        setLocating(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setLatitude(lat);
          setLongitude(lng);
          setLocating(false);

          // Reverse geocode via OpenStreetMap
          fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`, {
            headers: { 'Accept-Language': 'id-ID,id;q=0.9' }
          })
            .then((r) => r.json())
            .then((res) => {
              if (res && res.address) {
                const city = res.address.city || res.address.town || res.address.municipality || res.address.city_district || '';
                const area = res.address.suburb || res.address.village || res.address.neighbourhood || '';
                let name = '';
                if (area && city) name = `${area}, ${city}`;
                else name = area || city || 'GPS Terdeteksi';
                setLocationName(name);
                localStorage.setItem('otova_location_name', name);
                localStorage.setItem('otova_user_lat', lat.toString());
                localStorage.setItem('otova_user_lng', lng.toString());
              } else {
                setLocationName('GPS Terdeteksi');
              }
            })
            .catch(() => {
              setLocationName('GPS Terdeteksi');
            });
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

  const handleAddService = () => {
    if (!newServiceName.trim()) {
      alert("Nama paket layanan tidak boleh kosong.");
      return;
    }
    const priceNum = Number(newServicePrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      alert("Harga paket layanan harus berupa nominal angka positif.");
      return;
    }

    const newId = `srv-${Date.now()}`;
    const newService = {
      id: newId,
      name: newServiceName.trim(),
      price: priceNum,
      vehicle: newServiceVehicle,
    };

    setServices([...services, newService]);
    setNewServiceName('');
    setNewServicePrice('');
    setNewServiceVehicle('semua');
  };

  const handleRemoveService = (id: string) => {
    setServices(services.filter((s) => s.id !== id));
  };

  const handleUploadKtp = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setKtpUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload KTP gagal');
      setKtpPhoto(data.url);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setKtpUploading(false);
    }
  };

  const handleUploadBusiness = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBusinessUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload Foto Usaha gagal');
      setBusinessPhoto(data.url);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setBusinessUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    if (!businessName || !address) {
      setError("Harap isi semua field wajib pendaftaran.");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partner_type: partnerType,
          business_name: businessName,
          address,
          latitude,
          longitude,
          services: JSON.stringify(services),
          ktp_photo: ktpPhoto,
          business_photo: businessPhoto,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mendaftar sebagai mitra');

      alert("Pendaftaran mitra berhasil dikirim! Menunggu persetujuan verifikasi dari Admin.");
      router.push('/mitra/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem.');
      setSubmitting(false);
    }
  };

  if (loadingUser) {
    return <div className="text-center py-20 text-gray-400 text-xs">Memeriksa autentikasi pengguna...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto py-6 space-y-6">
      <div className="text-center space-y-1.5">
        <div className="mb-2">
          <Store className="w-10 h-10 text-emerald-400 mx-auto" />
        </div>
        <h1 className="text-2xl font-extrabold text-white">Lengkapi Profil Mitra OTOVA</h1>
        <p className="text-xs text-gray-400">
          Lengkapi formulir berikut agar bengkel atau jasa montir Anda dapat diverifikasi oleh admin.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-6 rounded-3xl space-y-5 shadow-2xl border border-gray-800">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Section 1: Business Meta */}
        <div className="space-y-4">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 border-b border-gray-800 pb-1">
            Informasi Jasa
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">Nama Toko & Jasa Bengkel *</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
                placeholder="Contoh: Bengkel Motor Harapan Baru"
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">Kategori Jasa *</label>
              <select
                value={partnerType}
                onChange={(e) => setPartnerType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
              >
                <option value="bengkel">Bengkel Kendaraan (Statis)</option>
                <option value="teknisi">Montir/Teknisi Darurat (Keliling)</option>
                <option value="tambal_ban">Tambal Ban Keliling</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">Alamat Lengkap Usaha *</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              placeholder="Contoh: Jl. Dipatiukur No. 45, Coblong, Bandung"
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs"
            />
          </div>
        </div>

        {/* Section 2: Geolocator coordinates */}
        <div className="space-y-4 pt-1">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 border-b border-gray-800 pb-1">
            Titik Koordinat GPS
          </h2>

          <div className="p-3.5 rounded-2xl bg-gray-900/60 border border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-400" /> Koordinat Saat Ini
              </span>
              <p className="text-[11px] text-gray-400">
                Latitude: {latitude.toFixed(6)}, Longitude: {longitude.toFixed(6)} ({locationName})
              </p>
            </div>
            <button
              type="button"
              onClick={handleGetGPS}
              className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400 font-bold text-[11px] transition-all flex items-center justify-center gap-1.5"
            >
              {locating ? 'Mendeteksi GPS...' : 'Dapatkan Koordinat GPS'}
            </button>
          </div>
        </div>

        {/* Section 3: Custom Services List Builder */}
        <div className="space-y-4 pt-1">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 border-b border-gray-800 pb-1">
            Paket Layanan & Tarif (Opsional)
          </h2>
          <p className="text-[10px] text-gray-400">
            Anda dapat mendefinisikan menu paket perbaikan spesifik dengan harga tetap yang bisa dipilih oleh pelanggan.
          </p>

          <div className="p-4 rounded-2xl bg-gray-950/40 border border-gray-800 space-y-3.5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400">Nama Perbaikan</label>
                <input
                  type="text"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  placeholder="Ganti Oli Mesin MPX2"
                  className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 text-xs text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400">Harga Paket (Rp)</label>
                <input
                  type="number"
                  value={newServicePrice}
                  onChange={(e) => setNewServicePrice(e.target.value)}
                  placeholder="e.g. 65000"
                  className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 text-xs text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400">Batasan Kendaraan</label>
                <select
                  value={newServiceVehicle}
                  onChange={(e) => setNewServiceVehicle(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 text-xs text-white"
                >
                  <option value="semua">Motor & Mobil</option>
                  <option value="motor">Khusus Sepeda Motor</option>
                  <option value="mobil">Khusus Mobil</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddService}
              className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-md shadow-emerald-500/10"
            >
              <Plus className="w-4 h-4" /> Tambah Paket Layanan
            </button>
          </div>

          {services.length > 0 && (
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {services.map((item) => (
                <div
                  key={item.id}
                  className="px-3 py-2 rounded-xl bg-gray-900/60 border border-gray-800 flex items-center justify-between text-xs transition-all hover:border-gray-700"
                >
                  <div className="space-y-0.5">
                    <p className="font-semibold text-gray-200">{item.name}</p>
                    <p className="text-[10px] text-gray-400 uppercase">
                      Rp {item.price.toLocaleString('id-ID')} | {item.vehicle === 'semua' ? 'Motor & Mobil' : item.vehicle}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveService(item.id)}
                    className="p-1 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 4: File upload section */}
        <div className="space-y-4 pt-1">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 border-b border-gray-800 pb-1">
            Ujian Kelayakan & Foto Dokumen
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-2xl bg-gray-900/30 border border-gray-800/80 flex flex-col gap-3">
              <div className="flex items-center gap-4">
                <Camera className="w-8 h-8 text-teal-400 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-bold text-gray-200">Foto KTP Pemilik *</p>
                  <label className="mt-1 block text-[10px] text-emerald-400 cursor-pointer hover:underline">
                    {ktpUploading ? 'Mengunggah...' : 'Pilih file KTP untuk diupload...'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadKtp}
                      disabled={ktpUploading}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              {ktpPhoto && (
                <div className="h-28 w-full rounded-xl overflow-hidden bg-gray-950/70 border border-gray-800 relative">
                  <img src={ktpPhoto} alt="KTP Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div className="p-3.5 rounded-2xl bg-gray-900/30 border border-gray-800/80 flex flex-col gap-3">
              <div className="flex items-center gap-4">
                <Camera className="w-8 h-8 text-teal-400 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-bold text-gray-200">Foto Usaha / Bengkel *</p>
                  <label className="mt-1 block text-[10px] text-emerald-400 cursor-pointer hover:underline">
                    {businessUploading ? 'Mengunggah...' : 'Pilih foto tempat usaha untuk diupload...'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadBusiness}
                      disabled={businessUploading}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              {businessPhoto && (
                <div className="h-28 w-full rounded-xl overflow-hidden bg-gray-950/70 border border-gray-800 relative">
                  <img src={businessPhoto} alt="Business Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 mt-4"
        >
          {submitting ? (
            'Mengirimkan Pendaftaran...'
          ) : (
            <>
              Kirim Pendaftaran Mitra <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
