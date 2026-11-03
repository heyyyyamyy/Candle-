import React from 'react';
import { AppNotification } from '../types';
import { Bell, CheckCheck, X, Truck, ShieldAlert, Package, Sparkles } from 'lucide-react';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAllAsRead: () => void;
  onMarkAsRead: (id: string) => void;
  pushEnabled: boolean;
  onTogglePush: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onMarkAsRead,
  pushEnabled,
  onTogglePush,
}) => {
  if (!isOpen) return null;

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'order_update':
        return <Truck className="w-4 h-4 text-amber-400" />;
      case 'inventory_alert':
        return <Package className="w-4 h-4 text-blue-400" />;
      case 'security':
        return <ShieldAlert className="w-4 h-4 text-emerald-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-sm bg-stone-900 border-l border-stone-800 text-stone-100 flex flex-col shadow-2xl">
          {/* Header */}
          <div className="px-5 py-4 border-b border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-500" />
              <h3 className="font-serif text-base font-bold">Activity &amp; Notifications</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-stone-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Push status toggle bar */}
          <div className="px-5 py-3 bg-stone-950 border-b border-stone-800 flex items-center justify-between text-xs">
            <span className="text-stone-400">Push Notifications</span>
            <button
              onClick={onTogglePush}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition ${
                pushEnabled
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              {pushEnabled ? '● Active' : '○ Disabled'}
            </button>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5">
            {notifications.length === 0 ? (
              <div className="py-16 text-center text-stone-500 text-xs">
                No new notifications.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => onMarkAsRead(n.id)}
                  className={`p-3.5 rounded-xl border text-xs cursor-pointer transition flex items-start gap-3 ${
                    n.read
                      ? 'bg-stone-950/60 border-stone-800/80 text-stone-400'
                      : 'bg-stone-850 border-amber-500/40 text-stone-200 shadow'
                  }`}
                >
                  <div className="p-2 rounded-lg bg-stone-900 shrink-0 mt-0.5">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-stone-100">{n.title}</span>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-1" />}
                    </div>
                    <p className="text-[11px] text-stone-400 leading-relaxed">{n.body}</p>
                    <span className="text-[10px] text-stone-500 font-mono block pt-1">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Action */}
          {notifications.length > 0 && (
            <div className="p-4 border-t border-stone-800 bg-stone-950">
              <button
                onClick={onMarkAllAsRead}
                className="w-full py-2 rounded-xl bg-stone-850 hover:bg-stone-800 text-stone-300 text-xs font-semibold transition flex items-center justify-center gap-1.5"
              >
                <CheckCheck className="w-4 h-4 text-amber-400" />
                <span>Mark All as Read</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
