import React, { useState, useEffect } from 'react';
import { PostWithDetails, ShelfFolder } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { StoryCard } from '../components/story/StoryCard';
import { Bookmark, Clock, Star, Sparkles, Trash2 } from 'lucide-react';

interface ShelfPageProps {
  onNavigate: (path: string) => void;
  onOpenShare: (title: string, url: string) => void;
}

export const ShelfPage: React.FC<ShelfPageProps> = ({ onNavigate, onOpenShare }) => {
  const { user } = useAuth();
  const { success } = useToast();

  const [activeFolder, setActiveFolder] = useState<ShelfFolder>('recently_saved');
  const [posts, setPosts] = useState<PostWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchShelf = async (folder: ShelfFolder) => {
    setLoading(true);
    try {
      const res = await api.getBookmarks(folder);
      setPosts(res.posts);
    } catch {
      // safe
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchShelf(activeFolder);
    }
  }, [activeFolder, user]);

  const handleRemove = async (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.toggleBookmark(postId, activeFolder);
      success('Removed from shelf');
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch {
      // safe
    }
  };

  const folders: Array<{ id: ShelfFolder; label: string; icon: React.FC<{ className?: string }> }> = [
    { id: 'recently_saved', label: 'Recently Saved', icon: Bookmark },
    { id: 'reading_later', label: 'Reading Later', icon: Clock },
    { id: 'favorites', label: 'Curated Favorites', icon: Star }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="border-b border-stone-200 dark:border-stone-800 pb-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-1">
          <Bookmark className="w-4 h-4" />
          <span>Personal Sanctuary</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 dark:text-stone-50">
          My Reading Shelf
        </h1>
        <p className="text-sm font-serif text-stone-600 dark:text-stone-400 mt-1">
          Preserve essays, research papers, and stories for distraction-free contemplation.
        </p>
      </div>

      {/* Shelf Folders Filter (Clean Segmented Buttons) */}
      <div className="flex items-center gap-2">
        {folders.map(f => {
          const Icon = f.icon;
          const isActive = activeFolder === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setActiveFolder(f.id)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                isActive
                  ? 'bg-stone-900 text-white dark:bg-blue-600 dark:text-white shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{f.label}</span>
            </button>
          );
        })}
      </div>

      {/* Shelf Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 rounded-xl bg-stone-100 dark:bg-stone-800/40 animate-pulse" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="py-20 text-center bg-stone-50/50 dark:bg-stone-900/30 rounded-2xl border border-dashed border-stone-300 dark:border-stone-800 p-8">
          <p className="text-lg font-serif font-medium text-stone-800 dark:text-stone-200">
            No stories in "{folders.find(f => f.id === activeFolder)?.label}"
          </p>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            Browse through INKWAVE and bookmark articles that provoke your thinking to build your reading archive.
          </p>
          <button
            onClick={() => onNavigate('/discover')}
            className="mt-4 px-4 py-2 bg-stone-900 dark:bg-blue-600 text-white rounded-lg text-xs font-semibold"
          >
            Explore Catalog
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map(post => (
            <div key={post.id} className="relative group">
              <StoryCard
                post={post}
                onNavigate={onNavigate}
                onOpenShare={onOpenShare}
                layout="standard"
              />
              <button
                onClick={(e) => handleRemove(post.id, e)}
                className="absolute top-3 right-3 p-1.5 bg-black/60 hover:bg-red-600 text-white rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-all shadow-md z-10"
                title="Remove from shelf"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
