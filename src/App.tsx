import React, { useState, useEffect, useCallback } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { BottomNav } from './components/layout/BottomNav';
import { Footer } from './components/layout/Footer';
import { AuthModal } from './components/common/AuthModal';
import { ShareModal } from './components/common/ShareModal';
import { SearchModal } from './components/common/SearchModal';
import { KeyboardShortcutsModal } from './components/common/KeyboardShortcutsModal';
import { DemoSwitcher } from './components/common/DemoSwitcher';

import { HomePage } from './pages/HomePage';
import { DiscoverPage } from './pages/DiscoverPage';
import { StoryPage } from './pages/StoryPage';
import { WritePage } from './pages/WritePage';
import { ProfilePage } from './pages/ProfilePage';
import { ShelfPage } from './pages/ShelfPage';
import { DashboardPage } from './pages/DashboardPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { WavePage } from './pages/WavePage';
import { AdminPage } from './pages/AdminPage';

function AppContent() {
  const { user, authModal } = useAuth();
  const [currentPath, setCurrentPath] = useState(window.location.pathname || '/');

  // Modals state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [shareData, setShareData] = useState<{ isOpen: boolean; title: string; url: string }>({
    isOpen: false,
    title: '',
    url: ''
  });

  const navigate = useCallback((path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Listen to popstate for browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable) {
        return;
      }

      if (e.key === '/') {
        e.preventDefault();
        setIsSearchOpen(true);
      } else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        if (!user) authModal.open('login');
        else navigate('/write');
      } else if (e.key === 'g' || e.key === 'G') {
        e.preventDefault();
        navigate('/');
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        if (!user) authModal.open('login');
        else navigate('/shelf');
      } else if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsOpen(prev => !prev);
      } else if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsShortcutsOpen(false);
        setShareData(prev => ({ ...prev, isOpen: false }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [user, navigate, authModal]);

  const handleOpenShare = (title: string, url: string) => {
    setShareData({ isOpen: true, title, url });
  };

  // Route resolver
  const renderCurrentPage = () => {
    if (currentPath === '/') {
      return <HomePage onNavigate={navigate} onOpenShare={handleOpenShare} />;
    }

    if (currentPath.startsWith('/discover')) {
      return <DiscoverPage onNavigate={navigate} onOpenShare={handleOpenShare} />;
    }

    if (currentPath.startsWith('/story/')) {
      const postId = currentPath.replace('/story/', '');
      return <StoryPage postId={postId} onNavigate={navigate} onOpenShare={handleOpenShare} />;
    }

    if (currentPath === '/write') {
      return <WritePage onNavigate={navigate} />;
    }

    if (currentPath.startsWith('/edit/')) {
      const editPostId = currentPath.replace('/edit/', '');
      return <WritePage editPostId={editPostId} onNavigate={navigate} />;
    }

    if (currentPath.startsWith('/profile/')) {
      const username = currentPath.replace('/profile/', '');
      return <ProfilePage username={username} onNavigate={navigate} onOpenShare={handleOpenShare} />;
    }

    if (currentPath === '/shelf') {
      return <ShelfPage onNavigate={navigate} onOpenShare={handleOpenShare} />;
    }

    if (currentPath === '/dashboard') {
      return <DashboardPage onNavigate={navigate} />;
    }

    if (currentPath === '/notifications') {
      return <NotificationsPage onNavigate={navigate} />;
    }

    if (currentPath === '/wave') {
      return <WavePage onNavigate={navigate} onOpenShare={handleOpenShare} />;
    }

    if (currentPath === '/admin') {
      return <AdminPage onNavigate={navigate} />;
    }

    // Default 404
    return (
      <div className="max-w-md mx-auto py-24 text-center">
        <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 mb-2">
          Page Not Found
        </h2>
        <p className="text-sm text-stone-500 mb-6">
          The requested path does not exist on INKWAVE.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-stone-900 dark:bg-blue-600 text-white rounded-lg text-xs font-semibold"
        >
          Return Home
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] dark:bg-[#080C16] text-stone-900 dark:text-stone-100 transition-colors">
      <Navbar
        currentPath={currentPath}
        onNavigate={navigate}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      <div className="flex-1">
        {renderCurrentPage()}
      </div>

      <Footer
        onNavigate={navigate}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
      />

      <BottomNav
        currentPath={currentPath}
        onNavigate={navigate}
      />

      {/* Floating Demo Persona Switcher */}
      <DemoSwitcher />

      {/* Modals */}
      <AuthModal />
      <ShareModal
        isOpen={shareData.isOpen}
        title={shareData.title}
        url={shareData.url}
        onClose={() => setShareData(prev => ({ ...prev, isOpen: false }))}
      />
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectPost={(id) => navigate(`/story/${id}`)}
      />
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
