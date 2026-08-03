'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, Info, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Polling 10s
    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id?: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      fetchNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen && unreadCount > 0) markAsRead();
        }}
        className="relative p-2 rounded-xl text-gray-300 hover:text-white hover:bg-gray-800 transition-all"
        title="Notifikasi"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute right-0 mt-3 w-80 sm:w-96 glass-card rounded-2xl shadow-2xl p-4 z-50 border border-gray-800 max-h-[450px] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800 mb-3">
              <h3 className="font-bold text-gray-100 text-sm flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-400" />
                Notifikasi System
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAsRead()}
                  className="text-xs text-emerald-400 hover:underline"
                >
                  Tandai Dibaca
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">
                Belum ada notifikasi
              </p>
            ) : (
              <div className="space-y-2">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 rounded-xl transition-all ${
                      n.is_read
                        ? 'bg-gray-900/40 text-gray-400'
                        : 'bg-emerald-950/30 border border-emerald-500/20 text-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {n.type === 'order_baru' && (
                        <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      )}
                      {n.type === 'perubahan_biaya' && (
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      )}
                      {n.type === 'verifikasi_mitra' && (
                        <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <h4 className="text-xs font-semibold text-gray-100">
                          {n.title}
                        </h4>
                        <p className="text-xs text-gray-300 mt-0.5 leading-relaxed">
                          {n.message}
                        </p>
                        <span className="text-[10px] text-gray-500 mt-1 block">
                          {new Date(n.created_at).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
