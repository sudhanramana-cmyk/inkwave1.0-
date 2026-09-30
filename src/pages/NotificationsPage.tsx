import React, { useState, useEffect } from 'react';
import { NotificationItem } from '../types';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Bell, Heart, MessageSquare, CornerDownRight, UserPlus, Award, CheckCheck } from 'lucide-react';

interface NotificationsPageProps {
  onNavigate: (path: string) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ onNavigate }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { success } = useToast();

  const fetchNotifs = async () => {
    try {
      const res = await api.getNotifications();
      setNotifications(res.notifications);
    } catch {
      // safe
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAll = async () => {
    await api.markAllNotificationsRead().catch(() => {});
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    success('All activity marked as read');
  };

  const handleClickItem = async (n: NotificationItem) => {
    if (!n.is_read) {
      await api.markNotificationRead(n.id).catch(() => {});
      setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, is_read: true } : item));
    }
    if (n.link) {
      onNavigate(n.link);
    }
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-red-500" />;
      case 'comment':
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'reply':
        return <CornerDownRight className="w-4 h-4 text-purple-500" />;
      case 'follow':
        return <UserPlus className="w-4 h-4 text-emerald-500" />;
      case 'milestone':
        return <Award className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      
      <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-1">
            <Bell className="w-4 h-4" />
            <span>Activity Feed</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-50">
            Notifications
          </h1>
        </div>

        {notifications.some(n => !n.is_read) && (
          <button
            onClick={handleMarkAll}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer border border-stone-300 dark:border-stone-700"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-16 rounded-xl bg-stone-100 dark:bg-stone-800/40 animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="py-20 text-center bg-stone-50/50 dark:bg-stone-900/30 rounded-2xl border border-dashed border-stone-300 dark:border-stone-800 p-8">
          <p className="text-base font-serif text-stone-700 dark:text-stone-300">
            No notifications yet.
          </p>
          <p className="text-xs text-stone-400 mt-1">
            When readers comment on or follow your wave, updates will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <div
              key={n.id}
              onClick={() => handleClickItem(n)}
              className={`p-4 rounded-xl border transition-colors cursor-pointer flex items-start gap-3.5 ${
                n.is_read
                  ? 'bg-white/40 dark:bg-stone-900/30 border-stone-200/60 dark:border-stone-800/60 text-stone-600 dark:text-stone-400'
                  : 'bg-white dark:bg-stone-900 border-blue-200 dark:border-blue-900 shadow-xs text-stone-900 dark:text-stone-100'
              }`}
            >
              <div className="p-2 rounded-lg bg-stone-100 dark:bg-stone-800 shrink-0 mt-0.5">
                {getIcon(n.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                    {n.title}
                  </span>
                  <span className="text-[10px] text-stone-400 font-sans">
                    {new Date(n.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-stone-600 dark:text-stone-300">
                  {n.message}
                </p>
              </div>
              {!n.is_read && (
                <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 shrink-0" />
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
