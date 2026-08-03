'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserPlus, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          email,
          phone_number: phone,
          password,
          address,
          role: 'user',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Pendaftaran gagal');

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 space-y-6">
      <div className="text-center space-y-2">
        <div className="mb-3">
          <img src="/logo-otova.png" alt="OTOVA Logo" className="h-12 mx-auto object-contain brightness-0 invert" />
        </div>
        <h1 className="text-2xl font-extrabold text-white">Daftar Akun User Otova</h1>
        <p className="text-xs text-gray-400">
          Buat akun untuk memesan bantuan darurat dan booking bengkel.
        </p>
      </div>

      <form onSubmit={handleRegister} className="glass-card p-6 rounded-2xl space-y-4 shadow-xl">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-300">Nama Lengkap</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            placeholder="Contoh: Budi Santoso"
            className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-300">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="budi@gmail.com"
            className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-300">Nomor Telepon / WhatsApp</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            placeholder="08123456789"
            className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-300">Alamat Domisili</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Jl. Merdeka No. 10, Bandung"
            className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-300">Kata Sandi</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Minimal 6 karakter"
            className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            'Mendaftarkan...'
          ) : (
            <>
              Daftar Akun Sekarang <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <div className="text-center pt-2 text-xs text-gray-400 space-y-2">
          <p>
            Sudah punya akun?{' '}
            <Link href="/login" className="text-emerald-400 font-bold hover:underline">
              Masuk di sini
            </Link>
          </p>
          <div className="pt-2 border-t border-gray-800">
            Ingin mendaftar sebagai Penyedia Jasa / Bengkel?{' '}
            <Link href="/register-mitra" className="text-teal-300 font-bold hover:underline">
              Daftar Mitra
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
