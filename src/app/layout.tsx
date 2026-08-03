import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'OTOVA — Platform Bantuan Kendaraan & Booking Bengkel',
  description:
    'Solusi cepat darurat mogok, tambal ban keliling, montir panggilan, dan booking servis bengkel terdekat.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="dark">
      <body className="bg-navy-900 text-gray-100 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8">
          {children}
        </main>
        <footer className="border-t border-gray-800/80 py-8 px-4 text-center text-xs text-gray-500 bg-navy-950 mt-12">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src="/logo-otova.png" alt="OTOVA Logo" className="h-6 object-contain" />
              <span>© 2026 Platform Bantuan Kendaraan Indonesia.</span>
            </div>
            <p className="text-gray-400">
              Dibuat dengan Next.js 14 App Router, Prisma ORM, & Tailwind CSS.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
