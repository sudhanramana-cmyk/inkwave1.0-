import React, { useState, useEffect, useRef } from 'react';
import { Logo } from '../brand/Logo';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';
import { NotificationItem } from '../../types';
import {
  Search,
  PenSquare,
  Sun,
  Moon,
  Bell,
  User,
  Bookmark,
  LayoutDashboard,
  Shield,
  LogOut,
  ChevronDown
} from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate, onOpenSearch }) => {
  const { user, logout, authModal } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      api.getNotifications()
        .then(res => {
          setNotifications(res.notifications.slice(0, 5));
          setUnreadCount(res.unreadCount);
        })
        .catch(() => {});
    }
  }, [user]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    await api.markAllNotificationsRead().catch(() => {});
    setUnreadCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-200/80 dark:border-stone-800/80 bg-[#FBF9F5]/90 dark:bg-[#080C16]/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <button
          onClick={() => onNavigate('/')}
          className="flex items-center text-left focus:outline-none cursor-pointer"
        >
          <Logo size="md" />
        </button>

        {/* Zone 2: 4-6 Clean Text Navigation Links (Zero pills, text + subtle underline) */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600 dark:text-stone-300">
          <button
            onClick={() => onNavigate('/')}
            className={`transition-colors whitespace-nowrap cursor-pointer ${
              currentPath === '/'
                ? 'text-stone-950 dark:text-white font-semibold underline underline-offset-8 decoration-2 decoration-blue-600'
                : 'hover:text-stone-950 dark:hover:text-white'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => onNavigate('/discover')}
            className={`transition-colors whitespace-nowrap cursor-pointer ${
              currentPath.startsWith('/discover')
                ? 'text-stone-950 dark:text-white font-semibold underline underline-offset-8 decoration-2 decoration-blue-600'
                : 'hover:text-stone-950 dark:hover:text-white'
            }`}
          >
            Discover
          </button>
          {user && (
            <button
              onClick={() => onNavigate('/wave')}
              className={`transition-colors whitespace-nowrap cursor-pointer ${
                currentPath === '/wave'
                  ? 'text-stone-950 dark:text-white font-semibold underline underline-offset-8 decoration-2 decoration-blue-600'
                  : 'hover:text-stone-950 dark:hover:text-white'
              }`}
            >
              Your Wave
            </button>
          )}
          <button
            onClick={() => {
              if (!user) authModal.open('login');
              else onNavigate('/shelf');
            }}
            className={`transition-colors whitespace-nowrap cursor-pointer ${
              currentPath === '/shelf'
                ? 'text-stone-950 dark:text-white font-semibold underline underline-offset-8 decoration-2 decoration-blue-600'
                : 'hover:text-stone-950 dark:hover:text-white'
            }`}
          >
            Reading Shelf
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-3">
          {/* Quick Search trigger */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-2.5 py-1.5 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 text-xs rounded-lg border border-stone-200 dark:border-stone-800 bg-white/50 dark:bg-stone-900/50 transition-colors cursor-pointer"
            title="Search stories (Press /)"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden lg:inline px-1.5 py-0.2 bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded text-[10px] font-mono">
              /
            </kbd>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition-colors rounded-lg cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Write CTA button */}
          <button
            onClick={() => {
              if (!user) authModal.open('login');
              else onNavigate('/write');
            }}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-stone-950 hover:bg-stone-800 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg transition-colors whitespace-nowrap shadow-xs cursor-pointer"
          >
            <PenSquare className="w-3.5 h-3.5" />
            <span>Write</span>
          </button>

          {/* If Authenticated: Notification Bell + User Menu */}
          {user ? (
            <div className="flex items-center gap-2">
              {/* Notifications */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className="relative p-2 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors cursor-pointer"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white dark:ring-stone-950" />
                  )}
                </button>

                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 p-2 bg-[#FBF9F5] dark:bg-[#0E1526] border border-stone-200 dark:border-stone-800 rounded-xl shadow-2xl z-50 text-xs">
                    <div className="flex items-center justify-between px-2 py-1.5 border-b border-stone-200 dark:border-stone-800">
                      <span className="font-semibold text-stone-900 dark:text-stone-100">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="py-1 max-h-72 overflow-y-auto divide-y divide-stone-100 dark:divide-stone-800/50">
                      {notifications.length === 0 ? (
                        <div className="py-6 text-center text-stone-400 text-xs">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map(n => (
                          <div
                            key={n.id}
                            onClick={() => {
                              onNavigate(n.link);
                              setNotifDropdownOpen(false);
                            }}
                            className={`p-2.5 rounded-lg cursor-pointer transition-colors ${
                              n.is_read ? 'hover:bg-stone-100 dark:hover:bg-stone-800/50 text-stone-600 dark:text-stone-300' : 'bg-blue-50/60 dark:bg-blue-950/40 text-stone-900 dark:text-stone-100 font-medium'
                            }`}
                          >
                            <div className="text-[11px] font-semibold text-stone-900 dark:text-stone-100 mb-0.5">
                              {n.title}
                            </div>
                            <div className="text-stone-500 dark:text-stone-400 leading-snug">
                              {n.message}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="pt-1.5 border-t border-stone-200 dark:border-stone-800 text-center">
                      <button
                        onClick={() => {
                          onNavigate('/notifications');
                          setNotifDropdownOpen(false);
                        }}
                        className="text-[11px] text-stone-500 hover:text-stone-900 dark:hover:text-stone-200 font-medium py-1"
                      >
                        View all activity
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* User Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1.5 p-1 rounded-full hover:ring-2 hover:ring-stone-300 dark:hover:ring-stone-700 transition-all cursor-pointer"
                >
                  <img
                    src={user.avatar_url}
                    alt={user.name}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full object-cover border border-stone-300 dark:border-stone-700"
                  />
                  <ChevronDown className="w-3 h-3 text-stone-400 hidden sm:block" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 p-1.5 bg-[#FBF9F5] dark:bg-[#0E1526] border border-stone-200 dark:border-stone-800 rounded-xl shadow-2xl z-50 text-xs">
                    <div className="px-3 py-2 border-b border-stone-200 dark:border-stone-800 mb-1">
                      <div className="font-semibold text-stone-900 dark:text-stone-100 truncate">
                        {user.name}
                      </div>
                      <div className="text-[11px] text-stone-500 truncate">
                        @{user.username}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onNavigate(`/profile/${user.username}`);
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/60 transition-colors"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Your Profile</span>
                    </button>

                    <button
                      onClick={() => {
                        onNavigate('/dashboard');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/60 transition-colors"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      <span>Creator Dashboard</span>
                    </button>

                    <button
                      onClick={() => {
                        onNavigate('/shelf');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/60 transition-colors"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>Reading Shelf</span>
                    </button>

                    {user.role === 'admin' && (
                      <button
                        onClick={() => {
                          onNavigate('/admin');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/60 transition-colors"
                      >
                        <Shield className="w-3.5 h-3.5 text-blue-500" />
                        <span>Moderator Panel</span>
                      </button>
                    )}

                    <div className="pt-1 mt-1 border-t border-stone-200 dark:border-stone-800">
                      <button
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <button
              onClick={() => authModal.open('login')}
              className="px-3.5 py-1.5 text-xs font-semibold text-stone-900 dark:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
