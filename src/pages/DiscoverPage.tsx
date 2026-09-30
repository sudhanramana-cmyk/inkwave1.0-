import React, { useEffect, useState } from 'react';
import { PostWithDetails, Category } from '../types';
import { api } from '../services/api';
import { StoryCard } from '../components/story/StoryCard';
import { Search, Flame, Sparkles, BookOpen, Zap, Lightbulb, Compass, Filter, RefreshCw } from 'lucide-react';

interface DiscoverPageProps {
  onNavigate: (path: string) => void;
  onOpenShare: (title: string, url: string) => void;
}

type DiscoverSection = 'trending' | 'newest' | 'thought_starters' | 'deep_reads' | 'quick_reads';

export const DiscoverPage: React.FC<DiscoverPageProps> = ({ onNavigate, onOpenShare }) => {
  const [activeSection, setActiveSection] = useState<DiscoverSection>('trending');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState<PostWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  // Load categories
  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => {});
  }, []);

  // Fetch posts based on filters
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);

    const sortMap: Record<DiscoverSection, 'trending' | 'newest' | 'popular' | 'deep_reads' | 'quick_reads'> = {
      trending: 'trending',
      newest: 'newest',
      thought_starters: 'popular',
      deep_reads: 'deep_reads',
      quick_reads: 'quick_reads'
    };

    api.getPosts({
      category: selectedCategory || undefined,
      search: searchQuery || undefined,
      sort: sortMap[activeSection]
    })
      .then(res => {
        if (!isCancelled) {
          setPosts(res.posts);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!isCancelled) setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [activeSection, selectedCategory, searchQuery]);

  const sections: Array<{ id: DiscoverSection; label: string; icon: React.FC<{ className?: string }> }> = [
    { id: 'trending', label: 'Trending Now', icon: Flame },
    { id: 'newest', label: 'Freshly Written', icon: Sparkles },
    { id: 'thought_starters', label: 'Thought Starters', icon: Lightbulb },
    { id: 'deep_reads', label: 'Deep Reads', icon: BookOpen },
    { id: 'quick_reads', label: 'Quick Reads', icon: Zap }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-stone-200 dark:border-stone-800 pb-8">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-blue-600 dark:text-blue-400 font-semibold mb-1">
            <Compass className="w-4 h-4" />
            <span>INKWAVE Archive & Discoveries</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 dark:text-stone-50">
            Explore Considered Thought
          </h1>
          <p className="text-sm text-stone-600 dark:text-stone-400 font-serif mt-1">
            Filter by curated curation themes, inquiry domains, or search across essays.
          </p>
        </div>

        {/* Search input in discovery header */}
        <div className="w-full md:w-80 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search titles, authors, tags..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-xs text-stone-400 hover:text-stone-600"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Discovery Sections Segmented Controls (Button tabs) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-stone-200/60 dark:border-stone-800/60 no-scrollbar">
        {sections.map(s => {
          const Icon = s.icon;
          const isActive = activeSection === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-stone-900 text-white dark:bg-blue-600 dark:text-white shadow-xs'
                  : 'bg-stone-100 dark:bg-stone-800/70 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-stone-400 font-medium mr-1 flex items-center gap-1">
          <Filter className="w-3 h-3" />
          <span>Category:</span>
        </span>
        <button
          onClick={() => setSelectedCategory('')}
          className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
            selectedCategory === ''
              ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
          }`}
        >
          All Topics
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(selectedCategory === cat.slug ? '' : cat.slug)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              selectedCategory === cat.slug
                ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Posts Results */}
      <div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-72 rounded-xl bg-stone-100 dark:bg-stone-800/40 animate-pulse" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="py-20 text-center bg-stone-50/60 dark:bg-stone-900/30 rounded-2xl border border-dashed border-stone-300 dark:border-stone-800 p-8">
            <h3 className="text-lg font-serif font-semibold text-stone-800 dark:text-stone-200">
              No stories match your criteria
            </h3>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              Try adjusting your topic filters or search term to discover different ideas.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('');
                setSearchQuery('');
                setActiveSection('trending');
              }}
              className="mt-4 px-4 py-1.5 bg-stone-900 dark:bg-blue-600 text-white text-xs font-semibold rounded-lg hover:opacity-90"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map(post => (
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
      </div>

    </div>
  );
};
