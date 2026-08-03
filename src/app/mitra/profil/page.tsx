'use client';

import { useState, useEffect } from 'react';
import { Store, QrCode, Save, CheckCircle2, Wrench, Trash2, Plus } from 'lucide-react';

export default function MitraProfilPage() {
  const [partner, setPartner] = useState<any>(null);
  const [qrisPhoto, setQrisPhoto] = useState('');
  const [basePriceMotor, setBasePriceMotor] = useState(35000);
  const [basePriceMobil, setBasePriceMobil] = useState(75000);

  // Dynamic Service List State
  const [servicesList, setServicesList] = useState<
    Array<{ id: string; name: string; vehicle: 'motor' | 'mobil' | 'semua'; price: number }>
  >([]);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceVehicle, setNewServiceVehicle] = useState<'motor' | 'mobil' | 'semua'>('semua');
  const [newServicePrice, setNewServicePrice] = useState<number | ''>('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user.partner) {
          setPartner(data.user.partner);
          setQrisPhoto(data.user.partner.qris_photo || '');
          setBasePriceMotor(data.user.partner.base_price_motor || 35000);
          setBasePriceMobil(data.user.partner.base_price_mobil || 75000);

          // Parse JSON services or set defaults
          if (data.user.partner.services) {
            try {
              const parsed = JSON.parse(data.user.partner.services);
              if (Array.isArray(parsed)) {
                setServicesList(parsed);
              } else {
                setServicesList([
                  { id: '1', name: data.user.partner.services, vehicle: 'semua', price: 50000 },
                ]);
              }
            } catch {
              setServicesList([
                { id: '1', name: data.user.partner.services, vehicle: 'semua', price: 50000 },
              ]);
            }
          }
        }
        setLoading(false);
      });
  }, []);

  const handleAddService = () => {
    if (!newServiceName.trim()) return;
    const newItem = {
      id: Date.now().toString(),
      name: newServiceName.trim(),
      vehicle: newServiceVehicle,
      price: typeof newServicePrice === 'number' ? newServicePrice : 0,
    };
    setServicesList([...servicesList, newItem]);
    setNewServiceName('');
    setNewServicePrice('');
  };

  const handleRemoveService = (id: string) => {
    setServicesList(servicesList.filter((s) => s.id !== id));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    try {
      const res = await fetch(`/api/partners/${partner.id}/online-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qris_photo: qrisPhoto,
          base_price_motor: Number(basePriceMotor),
          base_price_mobil: Number(basePriceMobil),
          services: JSON.stringify(servicesList),
        }),
      });
      if (res.ok) setSuccessMsg('Profil & daftar layanan berhasil diperbarui!');
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-16 text-gray-400 text-xs">Memuat profil...</div>;

  return (
    <div className="max-w-xl mx-auto space-y-6 py-4">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-extrabold text-white flex items-center justify-center gap-2">
          <Store className="w-6 h-6 text-emerald-400" /> Profil & Pembayaran QRIS
        </h1>
        <p className="text-xs text-gray-400">Kelola data usaha dan URL QRIS statis pembayaran.</p>
      </div>

      {partner && (
        <form onSubmit={handleSave} className="glass-card p-6 rounded-3xl space-y-4 border border-gray-800">
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> {successMsg}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">Nama Usaha / Mitra</label>
            <input type="text" value={partner.business_name} disabled
              className="w-full px-4 py-2.5 rounded-xl glass-input text-xs bg-gray-900/80 cursor-not-allowed" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">Alamat Usaha</label>
            <input type="text" value={partner.address} disabled
              className="w-full px-4 py-2.5 rounded-xl glass-input text-xs bg-gray-900/80 cursor-not-allowed" />
          </div>

          {/* Dynamic Custom Services Manager */}
          <div className="p-4 rounded-2xl bg-gray-900/90 border border-gray-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Wrench className="w-4 h-4" /> Kelola Daftar Layanan & Tarif Kustom
              </label>
              <span className="text-[10px] text-gray-400">
                {servicesList.length} Layanan Didaftarkan
              </span>
            </div>

            {/* List Layanan */}
            {servicesList.length === 0 ? (
              <p className="text-xs text-gray-500 italic text-center py-2">
                Belum ada layanan spesifik. Pengguna akan melihat tarif dasar umum.
              </p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {servicesList.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-gray-950/80 border border-gray-800 flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5">
                      <span className="font-bold text-white block">{item.name}</span>
                      <span className="text-[10px] text-gray-400 capitalize">
                        Kendaraan: <strong className="text-gray-300">{item.vehicle}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-bold text-emerald-400">
                        Rp {item.price.toLocaleString('id-ID')}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveService(item.id)}
                        className="p-1 rounded-lg text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all"
                        title="Hapus Layanan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Form Tambah Layanan */}
            <div className="pt-2 border-t border-gray-800 space-y-2">
              <span className="text-[11px] font-bold text-gray-300 block">Tambah Layanan Baru:</span>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                <input
                  type="text"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  placeholder="Contoh: Ganti Oli Shell / Tambal Tubeless"
                  className="sm:col-span-6 px-3 py-2 rounded-xl glass-input text-xs"
                />
                <select
                  value={newServiceVehicle}
                  onChange={(e: any) => setNewServiceVehicle(e.target.value)}
                  className="sm:col-span-3 px-3 py-2 rounded-xl glass-input text-xs"
                >
                  <option value="semua">Semua</option>
                  <option value="motor">🛵 Motor</option>
                  <option value="mobil">🚗 Mobil</option>
                </select>
                <input
                  type="number"
                  value={newServicePrice}
                  onChange={(e) => setNewServicePrice(e.target.value ? Number(e.target.value) : '')}
                  placeholder="Harga (Rp)"
                  className="sm:col-span-3 px-3 py-2 rounded-xl glass-input text-xs"
                />
              </div>
              <button
                type="button"
                onClick={handleAddService}
                className="w-full py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4" /> Tambahkan Layanan ke Daftar
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300 flex items-center gap-1">
              <QrCode className="w-4 h-4 text-emerald-400" /> URL Gambar QRIS Statis
            </label>
            <input type="text" value={qrisPhoto} onChange={(e) => setQrisPhoto(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-2.5 rounded-xl glass-input text-xs" />
            <p className="text-[10px] text-gray-500">Pengguna akan scan QRIS ini saat pembayaran.</p>
          </div>

          {qrisPhoto && (
            <div className="p-3 rounded-2xl bg-gray-900 text-center space-y-1 border border-gray-800">
              <span className="text-[11px] font-bold text-gray-300">Preview QRIS</span>
              <img src={qrisPhoto} alt="Preview QRIS" className="w-36 h-36 mx-auto object-contain rounded-xl" />
            </div>
          )}

          <button type="submit" disabled={saving}
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2">
            <Save className="w-4 h-4" /> {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </form>
      )}
    </div>
  );
}
