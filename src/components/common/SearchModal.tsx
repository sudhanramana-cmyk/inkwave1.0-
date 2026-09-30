import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, CornerDownLeft } from 'lucide-react';
import { api } from '../../services/api';
import { PostWithDetails } from '../../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPost: (id: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onSelectPost }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PostWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.getPosts({ search: query.trim(), limit: 6 });
        setResults(res.posts);
      } catch {
        // safe
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-stone-950/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#FBF9F5] dark:bg-[#0E1526] border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-stone-200 dark:border-stone-800">
          <Search className="w-5 h-5 text-stone-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by title, author, keyword, or category..."
            className="w-full bg-transparent text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline px-2 py-0.5 text-[10px] font-mono bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300 rounded border border-stone-300 dark:border-stone-700">
            Esc
          </kbd>
        </div>

        {/* Results Container */}
        <div className="max-h-96 overflow-y-auto p-3">
          {loading && (
            <div className="py-8 text-center text-xs text-stone-400">
              Searching publications...
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="py-10 text-center">
              <p className="text-sm font-serif text-stone-700 dark:text-stone-300">
                No matching stories found for "{query}".
              </p>
              <p className="text-xs text-stone-400 mt-1">
                Try searching for "silence", "architecture", "monolith", or author names.
              </p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="space-y-1">
              {results.map(post => (
                <button
                  key={post.id}
                  onClick={() => {
                    onSelectPost(post.id);
                    onClose();
                  }}
                  className="w-full text-left p-3 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800/60 transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <div className="min-w-0 pr-4">
                    <div className="flex items-center gap-2 text-[11px] text-stone-500 mb-1">
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {post.category?.name}
                      </span>
                      <span>·</span>
                      <span>{post.reading_time_minutes} min read</span>
                      <span>·</span>
                      <span>{post.author.name}</span>
                    </div>
                    <div className="font-serif font-semibold text-stone-900 dark:text-stone-100 text-sm truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {post.title}
                    </div>
                    {post.subtitle && (
                      <div className="text-xs text-stone-500 dark:text-stone-400 truncate mt-0.5">
                        {post.subtitle}
                      </div>
                    )}
                  </div>
                  <ArrowRight className="w-4 h-4 text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </button>
              ))}
            </div>
          )}

          {!query && (
            <div className="p-4 text-xs text-stone-500 dark:text-stone-400 space-y-2">
              <div className="font-semibold uppercase tracking-wider text-[10px] text-stone-400">
                Popular Discoveries
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {['Silence', 'Architecture', 'Monolith', 'Craftsmanship', 'Elena Rostova'].map(term => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-2.5 py-1 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-md text-xs text-stone-700 dark:text-stone-300 transition-colors cursor-pointer"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
