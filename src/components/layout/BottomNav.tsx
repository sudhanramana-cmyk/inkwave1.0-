import React from 'react';
import { Home, Compass, PenSquare, Bookmark, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface BottomNavProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentPath, onNavigate }) => {
  const { user, authModal } = useAuth();

  const items = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Discover', path: '/discover', icon: Compass },
    {
      label: 'Write',
      path: '/write',
      icon: PenSquare,
      requiresAuth: true
    },
    {
      label: 'Shelf',
      path: '/shelf',
      icon: Bookmark,
      requiresAuth: true
    },
    {
      label: 'Profile',
      path: user ? `/profile/${user.username}` : '#',
      icon: User,
      requiresAuth: true
    }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FBF9F5]/95 dark:bg-[#080C16]/95 backdrop-blur-md border-t border-stone-200 dark:border-stone-800 safe-area-bottom">
      <div className="flex items-center justify-around h-14 px-2">
        {items.map(item => {
          const Icon = item.icon;
          const isActive =
            item.path === '/'
              ? currentPath === '/'
              : currentPath.startsWith(item.path);

          return (
            <button
              key={item.label}
              onClick={() => {
                if (item.requiresAuth && !user) {
                  authModal.open('login');
                } else if (item.path !== '#') {
                  onNavigate(item.path);
                }
              }}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-colors ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-semibold'
                  : 'text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
