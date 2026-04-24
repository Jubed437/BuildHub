"use client";

import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NotificationBell() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/api/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 15 seconds for new notifications
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = async () => {
    try {
      await api.patch('/api/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) { console.error(err); }
  };

  const markRead = async (id: string) => {
    try {
      await api.patch(`/api/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) { console.error(err); }
  };

  const handleClick = async (n: any) => {
    await markRead(n._id);
    setOpen(false);
    if (n.type === 'application_received' && n.sender?._id) {
      router.push(`/dashboard/profile/${n.sender._id}`);
    } else if (n.project?._id) {
      router.push(`/dashboard/projects/${n.project._id}`);
    }
  };

  const iconForType = (type: string) => {
    switch (type) {
      case 'application_received': return 'person_add';
      case 'application_accepted': return 'check_circle';
      case 'application_rejected': return 'cancel';
      case 'new_task': return 'task_alt';
      case 'task_updated': return 'update';
      default: return 'notifications';
    }
  };

  const colorForType = (type: string) => {
    switch (type) {
      case 'application_accepted': return 'text-green-600';
      case 'application_rejected': return 'text-red-500';
      case 'application_received': return 'text-primary';
      case 'new_task': return 'text-tertiary';
      default: return 'text-secondary';
    }
  };

  const timeAgo = (date: string) => {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div ref={ref} className="relative">
      {/* Bell Button */}
      <button
        onClick={() => { setOpen(!open); if (!open) fetchNotifications(); }}
        className="relative p-2 rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors"
        aria-label="Notifications"
      >
        <span className="material-symbols-outlined text-2xl">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-primary rounded-full border-2 border-surface animate-pulse" />
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-full mt-3 w-96 bg-surface-container-lowest rounded-2xl shadow-2xl shadow-on-surface/10 border border-surface-container-high z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-surface-container">
            <h3 className="font-lexend font-bold text-on-surface">Notifications</h3>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-primary text-surface-container-lowest text-[10px] font-black rounded-full">
                  {unreadCount} new
                </span>
              )}
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-xs font-bold text-secondary hover:text-primary transition-colors">
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* Notification list */}
          <div className="max-h-[420px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-12 text-center">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant block mb-3">notifications_none</span>
                <p className="text-sm text-on-surface-variant font-medium">All caught up!</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => handleClick(n)}
                  className={`flex items-start gap-4 px-6 py-4 cursor-pointer transition-colors border-b border-surface-container last:border-0 ${!n.read ? 'bg-primary-fixed/10 hover:bg-primary-fixed/20' : 'hover:bg-surface-container-low'}`}
                >
                  {/* Icon */}
                  <div className={`mt-0.5 shrink-0 ${colorForType(n.type)}`}>
                    <span className="material-symbols-outlined text-xl">{iconForType(n.type)}</span>
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${!n.read ? 'text-on-surface font-semibold' : 'text-on-surface-variant font-medium'}`}>
                      {n.message}
                    </p>
                    {n.type === 'application_received' && n.sender ? (
                      <span className="text-[10px] text-primary font-bold mt-1 block">
                        View {n.sender.name}&apos;s profile →
                      </span>
                    ) : n.project ? (
                      <span className="text-[10px] text-primary font-bold mt-1 block">
                        {n.project.title} →
                      </span>
                    ) : null}
                    <p className="text-[10px] text-on-surface-variant mt-1">{timeAgo(n.createdAt)}</p>
                  </div>
                  {/* Unread dot */}
                  {!n.read && <div className="w-2 h-2 bg-primary rounded-full mt-2 shrink-0" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
