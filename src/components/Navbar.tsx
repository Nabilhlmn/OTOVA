'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Wrench,
  Shield,
  Clock,
  User,
  LogOut,
  Car,
  CalendarCheck,
  Menu,
  X,
  Store,
  LayoutDashboard,
  FileCheck,
  ShieldBan,
} from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setCurrentUser(data.user);
        } else {
          setCurrentUser(null);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setCurrentUser(null);
    router.push('/login');
    router.refresh();
  };

  const isUser = currentUser?.role === 'user';
  const isMitra = currentUser?.role === 'mitra';
  const isAdmin = currentUser?.role === 'admin';

  return (
    <nav className="glass-nav sticky top-0 z-50 px-4 sm:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-10 flex items-center">
            <img
              src="/logo-otova.png"
              alt="OTOVA Logo"
              className="h-10 w-auto object-contain group-hover:scale-105 transition-all"
            />
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-1">
          {isUser && (
            <>
              <Link
                href="/dashboard"
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  pathname === '/dashboard'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/60'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" /> Home
              </Link>
              <Link
                href="/cari-bantuan"
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  pathname === '/cari-bantuan'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/60'
                }`}
              >
                <Car className="w-4 h-4 text-emerald-400" /> Cari Bantuan
              </Link>
              <Link
                href="/booking-bengkel"
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  pathname.startsWith('/booking-bengkel')
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/60'
                }`}
              >
                <CalendarCheck className="w-4 h-4 text-blue-400" /> Booking Bengkel
              </Link>
              <Link
                href="/riwayat"
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  pathname === '/riwayat'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/60'
                }`}
              >
                <Clock className="w-4 h-4" /> Riwayat
              </Link>
            </>
          )}

          {isMitra && (
            <>
              <Link
                href="/mitra/dashboard"
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  pathname === '/mitra/dashboard'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/60'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" /> Dashboard Mitra
              </Link>
              <Link
                href="/mitra/order-masuk"
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  pathname === '/mitra/order-masuk'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/60'
                }`}
              >
                <Store className="w-4 h-4 text-emerald-400" /> Order Masuk
              </Link>
              <Link
                href="/mitra/profil"
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  pathname === '/mitra/profil'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/60'
                }`}
              >
                <Wrench className="w-4 h-4 text-amber-400" /> Profil & Tarif
              </Link>
              <Link
                href="/mitra/riwayat"
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  pathname === '/mitra/riwayat'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/60'
                }`}
              >
                <Clock className="w-4 h-4" /> Riwayat Mitra
              </Link>
            </>
          )}

          {isAdmin && (
            <>
              <Link
                href="/admin/dashboard"
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  pathname === '/admin/dashboard'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/60'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-purple-400" /> Overview
              </Link>
              <Link
                href="/admin/verifikasi-mitra"
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  pathname === '/admin/verifikasi-mitra'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/60'
                }`}
              >
                <FileCheck className="w-4 h-4 text-amber-400" /> Verifikasi Mitra
              </Link>
              <Link
                href="/admin/kelola-mitra"
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  pathname === '/admin/kelola-mitra'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/60'
                }`}
              >
                <ShieldBan className="w-4 h-4 text-red-400" /> Kelola Mitra
              </Link>
            </>
          )}
        </div>

        {/* User Right Action */}
        <div className="hidden md:flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-3 pl-3 border-l border-gray-800">
              <NotificationDropdown />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5">
                  <div className="w-full h-full bg-gray-900 rounded-full flex items-center justify-center text-xs font-bold text-emerald-400">
                    {currentUser.full_name?.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white line-clamp-1">
                    {currentUser.full_name}
                  </span>
                  <span className="text-[10px] text-emerald-400 capitalize font-medium flex items-center gap-1">
                    {currentUser.role === 'admin' ? (
                      <Shield className="w-3 h-3 text-purple-400 inline" />
                    ) : null}
                    {currentUser.role}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                title="Keluar"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-300 hover:text-white hover:bg-gray-800/60 transition-all"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-md shadow-emerald-500/20 transition-all"
              >
                Daftar Akun
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setMobileMenu(!mobileMenu)}
          className="md:hidden p-2 rounded-xl text-gray-300 hover:bg-gray-800"
        >
          {mobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenu && (
        <div className="md:hidden pt-4 pb-2 border-t border-gray-800 mt-3 space-y-2">
          {currentUser ? (
            <>
              <div className="p-3 rounded-xl bg-gray-900/60 flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">
                    {currentUser.full_name} ({currentUser.role})
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-xs text-rose-400 font-bold hover:underline"
                >
                  Logout
                </button>
              </div>

              {isUser && (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenu(false)}
                    className="block px-3 py-2 rounded-lg text-xs font-medium text-gray-200 hover:bg-gray-800"
                  >
                    Home Dashboard
                  </Link>
                  <Link
                    href="/cari-bantuan"
                    onClick={() => setMobileMenu(false)}
                    className="block px-3 py-2 rounded-lg text-xs font-medium text-emerald-400 hover:bg-gray-800"
                  >
                    Cari Bantuan Darurat
                  </Link>
                  <Link
                    href="/booking-bengkel"
                    onClick={() => setMobileMenu(false)}
                    className="block px-3 py-2 rounded-lg text-xs font-medium text-blue-400 hover:bg-gray-800"
                  >
                    Booking Bengkel
                  </Link>
                  <Link
                    href="/riwayat"
                    onClick={() => setMobileMenu(false)}
                    className="block px-3 py-2 rounded-lg text-xs font-medium text-gray-200 hover:bg-gray-800"
                  >
                    Riwayat Order
                  </Link>
                </>
              )}

              {isMitra && (
                <>
                  <Link
                    href="/mitra/dashboard"
                    onClick={() => setMobileMenu(false)}
                    className="block px-3 py-2 rounded-lg text-xs font-medium text-emerald-400 hover:bg-gray-800"
                  >
                    Mitra Dashboard
                  </Link>
                  <Link
                    href="/mitra/order-masuk"
                    onClick={() => setMobileMenu(false)}
                    className="block px-3 py-2 rounded-lg text-xs font-medium text-white hover:bg-gray-800"
                  >
                    Order Masuk
                  </Link>
                </>
              )}

              {isAdmin && (
                <>
                  <Link
                    href="/admin/dashboard"
                    onClick={() => setMobileMenu(false)}
                    className="block px-3 py-2 rounded-lg text-xs font-medium text-purple-400 hover:bg-gray-800"
                  >
                    🏠 Admin Dashboard
                  </Link>
                  <Link
                    href="/admin/verifikasi-mitra"
                    onClick={() => setMobileMenu(false)}
                    className="block px-3 py-2 rounded-lg text-xs font-medium text-amber-400 hover:bg-gray-800"
                  >
                    📋 Verifikasi Mitra
                  </Link>
                  <Link
                    href="/admin/kelola-mitra"
                    onClick={() => setMobileMenu(false)}
                    className="block px-3 py-2 rounded-lg text-xs font-medium text-red-400 hover:bg-gray-800"
                  >
                    🔴 Kelola & Bekukan Mitra
                  </Link>
                </>
              )}
            </>
          ) : (
            <div className="flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenu(false)}
                className="w-full text-center py-2.5 rounded-xl bg-gray-800 text-xs font-bold text-white"
              >
                Masuk Akun
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenu(false)}
                className="w-full text-center py-2.5 rounded-xl bg-emerald-500 text-xs font-bold text-white"
              >
                Daftar Sekarang
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
