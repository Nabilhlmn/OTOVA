'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Wrench, Shield, User, Store, KeyRound, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login gagal');
      }

      router.push(data.redirectUrl || '/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="max-w-md mx-auto py-8 space-y-6">
      <div className="text-center space-y-2">
        <div className="mb-3">
          <img src="/logo-otova.png" alt="OTOVA Logo" className="h-12 mx-auto object-contain" />
        </div>
        <h1 className="text-2xl font-extrabold text-white">Masuk ke Otova</h1>
        <p className="text-xs text-gray-400">
          Silakan masuk dengan akun User, Mitra, atau Admin Anda.
        </p>
      </div>

      {/* Quick Demo Login Preset Buttons */}
      <div className="glass-card p-4 rounded-2xl space-y-2 border border-gray-800">
        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block mb-2">
          ⚡ Quick Demo Login (Sekali Klik)
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => quickLogin('budi@gmail.com', '123456')}
            className="p-2.5 rounded-xl bg-gray-900 hover:bg-emerald-950/40 text-left border border-gray-800 hover:border-emerald-500/40 transition-all text-xs"
          >
            <div className="font-bold text-gray-200 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-400" /> User (Budi)
            </div>
            <span className="text-[10px] text-gray-500">budi@gmail.com</span>
          </button>

          <button
            type="button"
            onClick={() => quickLogin('majumotor@gmail.com', '123456')}
            className="p-2.5 rounded-xl bg-gray-900 hover:bg-emerald-950/40 text-left border border-gray-800 hover:border-emerald-500/40 transition-all text-xs"
          >
            <div className="font-bold text-gray-200 flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-blue-400" /> Mitra Bengkel
            </div>
            <span className="text-[10px] text-gray-500">majumotor@gmail.com</span>
          </button>

          <button
            type="button"
            onClick={() => quickLogin('agusmontir@gmail.com', '123456')}
            className="p-2.5 rounded-xl bg-gray-900 hover:bg-emerald-950/40 text-left border border-gray-800 hover:border-emerald-500/40 transition-all text-xs"
          >
            <div className="font-bold text-gray-200 flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5 text-amber-400" /> Mitra Montir
            </div>
            <span className="text-[10px] text-gray-500">agusmontir@gmail.com</span>
          </button>

          <button
            type="button"
            onClick={() => quickLogin('admin@otova.com', '123456')}
            className="p-2.5 rounded-xl bg-gray-900 hover:bg-purple-950/40 text-left border border-gray-800 hover:border-purple-500/40 transition-all text-xs"
          >
            <div className="font-bold text-gray-200 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-purple-400" /> Admin System
            </div>
            <span className="text-[10px] text-gray-500">admin@otova.com</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleLogin} className="glass-card p-6 rounded-2xl space-y-4 shadow-xl">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-300">Alamat Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="nama@email.com"
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
            placeholder="••••••••"
            className="w-full px-4 py-2.5 rounded-xl glass-input text-xs"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            'Memproses...'
          ) : (
            <>
              Masuk Sekarang <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <div className="text-center pt-2 text-xs text-gray-400">
          Belum punya akun?{' '}
          <Link href="/register" className="text-emerald-400 font-bold hover:underline">
            Daftar User Baru
          </Link>
        </div>
      </form>
    </div>
  );
}
