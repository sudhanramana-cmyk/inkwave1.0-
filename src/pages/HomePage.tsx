import React, { useEffect, useState } from 'react';
import { PostWithDetails } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { InteractiveWaveVisual } from '../components/home/InteractiveWaveVisual';
import { StoryCard } from '../components/story/StoryCard';
import { ArrowRight, Flame, Sparkles, Compass, PenSquare, Clock } from 'lucide-react';

interface HomePageProps {
  onNavigate: (path: string) => void;
  onOpenShare: (title: string, url: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenShare }) => {
  const { user, authModal } = useAuth();
  const [trendingPosts, setTrendingPosts] = useState<PostWithDetails[]>([]);
  const [streamPosts, setStreamPosts] = useState<PostWithDetails[]>([]);
  const [featuredPost, setFeaturedPost] = useState<PostWithDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [trendingRes, streamRes] = await Promise.all([
          api.getPosts({ sort: 'trending', limit: 4 }),
          api.getPosts({ sort: 'newest', limit: 8 })
        ]);

        if (trendingRes.posts.length > 0) {
          setFeaturedPost(trendingRes.posts[0]);
          setTrendingPosts(trendingRes.posts.slice(1));
        }
        setStreamPosts(streamRes.posts);
      } catch (err) {
        console.error('Failed to load home stream:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-20 pb-16">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-8 sm:pt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span>Independent Editorial Publishing</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-stone-950 dark:text-white leading-[1.08] tracking-tight">
              Your thoughts deserve a place to move.
            </h1>

            <p className="text-lg text-stone-600 dark:text-stone-300 font-serif leading-relaxed max-w-lg">
              Write. Publish. Discuss. Discover ideas worth staying for. A quiet space engineered for long-form craft and deliberate conversation.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => {
                  if (!user) authModal.open('login');
                  else onNavigate('/write');
                }}
                className="flex items-center gap-2 px-6 py-3 bg-stone-950 hover:bg-stone-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-sm font-semibold rounded-xl shadow-md transition-all duration-150 cursor-pointer"
              >
                <PenSquare className="w-4 h-4" />
                <span>Start Writing</span>
              </button>

              <button
                onClick={() => onNavigate('/discover')}
                className="flex items-center gap-2 px-6 py-3 bg-white/80 dark:bg-stone-900/80 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 text-sm font-semibold rounded-xl border border-stone-300 dark:border-stone-700 transition-all duration-150 cursor-pointer"
              >
                <Compass className="w-4 h-4" />
                <span>Explore Stories</span>
              </button>
            </div>

            {/* Quiet Stats Bar */}
            <div className="pt-6 border-t border-stone-200/80 dark:border-stone-800/80 flex items-center gap-8 text-xs text-stone-500 dark:text-stone-400">
              <div>
                <span className="font-semibold text-stone-900 dark:text-stone-100">100%</span> Human-authored
              </div>
              <div>
                <span className="font-semibold text-stone-900 dark:text-stone-100">0</span> Ad trackers
              </div>
              <div>
                <span className="font-semibold text-stone-900 dark:text-stone-100">Zero-distraction</span> Typography
              </div>
            </div>
          </div>

          {/* Right Hero Visual: Interactive Wave of Ideas Canvas */}
          <div className="lg:col-span-6">
            <InteractiveWaveVisual />
          </div>

        </div>
      </section>

      {/* 2. EDITORIAL FEATURED STORY SECTION */}
      {featuredPost && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
              <span className="text-xs uppercase tracking-widest font-semibold text-stone-500 dark:text-stone-400">
                Curator's Lead Feature
              </span>
            </div>
            <button
              onClick={() => onNavigate('/discover')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <StoryCard
            post={featuredPost}
            onNavigate={onNavigate}
            onOpenShare={onOpenShare}
            layout="featured"
          />
        </section>
      )}

      {/* 3. "WHAT'S MOVING THROUGH INKWAVE?" (Trending Section) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 border-b border-stone-200 dark:border-stone-800 pb-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400 mb-1">
              <Flame className="w-4 h-4" />
              <span>Trending Resonances</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100">
              What's moving through INKWAVE?
            </h2>
          </div>
          <button
            onClick={() => onNavigate('/discover')}
            className="text-xs font-medium text-stone-500 hover:text-stone-900 dark:hover:text-stone-200 flex items-center gap-1 cursor-pointer"
          >
            <span>All trending</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 rounded-xl bg-stone-100 dark:bg-stone-800/50 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {trendingPosts.map(post => (
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
      </section>

      {/* 4. HORIZONTAL "IDEA STREAM" SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-widest font-semibold text-stone-400 mb-1">
              Fluid Cadence
            </div>
            <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
              The Idea Stream
            </h2>
          </div>
          <button
            onClick={() => onNavigate('/discover')}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          >
            Browse all categories
          </button>
        </div>

        {/* Flowing horizontal cards */}
        <div className="flex gap-6 overflow-x-auto pb-4 pt-2 no-scrollbar snap-x">
          {streamPosts.map(post => (
            <div
              key={post.id}
              onClick={() => onNavigate(`/story/${post.id}`)}
              className="min-w-[280px] sm:min-w-[320px] max-w-[340px] shrink-0 p-5 rounded-xl bg-white/80 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800/80 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer snap-start flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-2 text-[11px] text-stone-500 mb-2">
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {post.category?.name}
                  </span>
                  <span>·</span>
                  <span>{post.reading_time_minutes} min read</span>
                </div>
                <h4 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100 line-clamp-2 mb-2 leading-snug">
                  {post.title}
                </h4>
                <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-3 font-serif">
                  {post.subtitle || post.content.slice(0, 110)}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500">
                <span className="truncate max-w-[150px] font-medium text-stone-700 dark:text-stone-300">
                  {post.author.name}
                </span>
                <span className="text-[11px]">
                  {new Date(post.published_at || post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. EDITORIAL MANIFESTO BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl p-8 sm:p-14 bg-stone-900 text-stone-100 dark:bg-[#0E1526] border border-stone-800 overflow-hidden">
          <div className="max-w-2xl space-y-4 relative z-10">
            <span className="text-xs uppercase tracking-widest text-blue-400 font-semibold">
              The INKWAVE Charter
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold leading-snug">
              "Ideas move. Stories stay."
            </h3>
            <p className="text-sm text-stone-300 font-serif leading-relaxed">
              We reject the algorithmic firehose that treats human attention as an extractable resource. INKWAVE is designed as an architectural courtyard for literature, technology critique, and intellectual reflection.
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  if (!user) authModal.open('register');
                  else onNavigate('/write');
                }}
                className="px-5 py-2.5 bg-white text-stone-900 hover:bg-stone-100 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Join the Writers Guild
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
