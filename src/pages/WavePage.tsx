import React, { useState, useEffect } from 'react';
import { PostWithDetails } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StoryCard } from '../components/story/StoryCard';
import { Waves, Sparkles, UserPlus } from 'lucide-react';

interface WavePageProps {
  onNavigate: (path: string) => void;
  onOpenShare: (title: string, url: string) => void;
}

export const WavePage: React.FC<WavePageProps> = ({ onNavigate, onOpenShare }) => {
  const { user, authModal } = useAuth();
  const [wavePosts, setWavePosts] = useState<PostWithDetails[]>([]);
  const [recommended, setRecommended] = useState<PostWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    Promise.all([
      api.getPosts({ feed: 'wave' }),
      api.getPosts({ sort: 'popular', limit: 3 })
    ])
      .then(([feedRes, recRes]) => {
        setWavePosts(feedRes.posts);
        setRecommended(recRes.posts);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <Waves className="w-10 h-10 text-blue-600 mx-auto mb-3" />
        <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 mb-2">
          Your Wave Awaits
        </h2>
        <p className="text-xs text-stone-500 mb-6">
          Sign in to curate your personal feed of followed essayists and thinkers.
        </p>
        <button
          onClick={() => authModal.open('login')}
          className="px-5 py-2.5 bg-stone-900 dark:bg-blue-600 text-white rounded-xl text-xs font-semibold"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Header */}
      <div className="border-b border-stone-200 dark:border-stone-800 pb-6">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-1">
          <Waves className="w-4 h-4" />
          <span>Curated Network</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 dark:text-stone-50">
          Your Wave
        </h1>
        <p className="text-sm font-serif text-stone-600 dark:text-stone-400 mt-1">
          Essays, manuscripts, and reflections from the minds you choose to follow.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 rounded-xl bg-stone-100 dark:bg-stone-800/40 animate-pulse" />
          ))}
        </div>
      ) : wavePosts.length === 0 ? (
        <div className="py-20 text-center bg-stone-50/50 dark:bg-stone-900/30 rounded-2xl border border-dashed border-stone-300 dark:border-stone-800 p-8">
          <p className="text-lg font-serif font-medium text-stone-800 dark:text-stone-200">
            Your wave is calm right now.
          </p>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            You haven't followed any authors yet, or your followed authors haven't published recently.
          </p>
          <button
            onClick={() => onNavigate('/discover')}
            className="mt-4 px-4 py-2 bg-stone-900 dark:bg-blue-600 text-white rounded-lg text-xs font-semibold"
          >
            Find Authors to Follow
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wavePosts.map(post => (
            <StoryCard
              key={post.id}
              post={post}
              onNavigate={onNavigate}
              onOpenShare={onOpenShare}
              layout="standard"
            />
          ))}
        </div>
      )}

      {/* Recommended Section: Because you read */}
      {recommended.length > 0 && (
        <div className="pt-10 border-t border-stone-200 dark:border-stone-800 space-y-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-stone-500">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>Because you read in architecture & philosophy</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommended.map(post => (
              <StoryCard
                key={post.id}
                post={post}
                onNavigate={onNavigate}
                onOpenShare={onOpenShare}
                layout="compact"
              />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
