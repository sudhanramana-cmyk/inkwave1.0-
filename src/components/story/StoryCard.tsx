import React, { useState } from 'react';
import { PostWithDetails, ShelfFolder } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { Heart, Bookmark, MessageSquare, Share2, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';

interface StoryCardProps {
  post: PostWithDetails;
  onNavigate: (path: string) => void;
  onOpenShare?: (title: string, url: string) => void;
  layout?: 'standard' | 'compact' | 'featured';
}

export const StoryCard: React.FC<StoryCardProps> = ({
  post,
  onNavigate,
  onOpenShare,
  layout = 'standard'
}) => {
  const { user, authModal } = useAuth();
  const { success } = useToast();

  const [liked, setLiked] = useState(post.user_liked || false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [bookmarked, setBookmarked] = useState(post.user_bookmarked || false);
  const [likeAnimating, setLikeAnimating] = useState(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      authModal.open('login');
      return;
    }

    // Burst animation
    if (!liked) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;
      try {
        confetti({
          particleCount: 15,
          spread: 40,
          origin: { x, y },
          colors: ['#ef4444', '#f97316'],
          disableForReducedMotion: true
        });
      } catch {}
    }

    setLikeAnimating(true);
    setTimeout(() => setLikeAnimating(false), 250);

    // Optimistic
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikesCount(prev => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));

    try {
      const res = await api.toggleLike(post.id);
      setLiked(res.liked);
      setLikesCount(res.count);
    } catch {
      // Revert on error
      setLiked(!nextLiked);
      setLikesCount(prev => (!nextLiked ? prev + 1 : Math.max(0, prev - 1)));
    }
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      authModal.open('login');
      return;
    }

    const nextBookmarked = !bookmarked;
    setBookmarked(nextBookmarked);

    try {
      const res = await api.toggleBookmark(post.id, 'recently_saved');
      setBookmarked(res.bookmarked);
      if (res.bookmarked) {
        success('Added to your Reading Shelf');
      } else {
        success('Removed from shelf');
      }
    } catch {
      setBookmarked(!nextBookmarked);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/story/${post.id}`;
    if (onOpenShare) {
      onOpenShare(post.title, url);
    } else {
      navigator.clipboard.writeText(url);
      success('Link copied to clipboard');
    }
  };

  const formattedDate = new Date(post.published_at || post.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });

  // Featured Layout
  if (layout === 'featured') {
    return (
      <article
        onClick={() => onNavigate(`/story/${post.id}`)}
        className="group relative cursor-pointer bg-white/70 dark:bg-stone-900/60 border border-stone-200/90 dark:border-stone-800/90 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          <div className="lg:col-span-7 relative h-72 lg:h-[420px] overflow-hidden bg-stone-100 dark:bg-stone-800">
            <img
              src={post.cover_image}
              alt={post.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/40 via-transparent to-transparent lg:hidden" />
          </div>

          <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-between">
            <div>
              {/* Zero-Pill Metadata */}
              <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 mb-3">
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {post.category?.name || 'Editorial'}
                </span>
                <span aria-hidden="true">·</span>
                <span>{post.reading_time_minutes} min read</span>
                <span aria-hidden="true">·</span>
                <span>{formattedDate}</span>
                {post.trending_score && post.trending_score > 3 && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400 font-medium">
                      <Flame className="w-3 h-3" />
                      Trending
                    </span>
                  </>
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-50 leading-tight tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-4">
                {post.title}
              </h2>

              <p className="text-stone-600 dark:text-stone-300 text-sm sm:text-base leading-relaxed line-clamp-3 mb-6 font-serif">
                {post.subtitle || post.content.slice(0, 180)}...
              </p>
            </div>

            <div className="pt-6 border-t border-stone-200/70 dark:border-stone-800/70 flex items-center justify-between">
              {/* Author byline */}
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigate(`/profile/${post.author.username}`);
                }}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <img
                  src={post.author.avatar_url}
                  alt={post.author.name}
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-full object-cover border border-stone-300 dark:border-stone-700"
                />
                <div>
                  <div className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                    {post.author.name}
                  </div>
                  <div className="text-[11px] text-stone-500">
                    @{post.author.username}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleLike}
                  className={`p-2 rounded-lg transition-colors cursor-pointer ${
                    liked
                      ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40'
                      : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
                  } ${likeAnimating ? 'scale-125' : ''}`}
                  title="Appreciate story"
                >
                  <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
                </button>
                <button
                  type="button"
                  onClick={handleBookmark}
                  className={`p-2 rounded-lg transition-colors cursor-pointer ${
                    bookmarked
                      ? 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40'
                      : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`}
                  title="Save to reading shelf"
                >
                  <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
                  title="Share story"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </article>
    );
  }

  // Standard Editorial Card
  return (
    <article
      onClick={() => onNavigate(`/story/${post.id}`)}
      className="group relative cursor-pointer bg-white/70 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800/80 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
    >
      <div>
        {/* Cover image if available */}
        {post.cover_image && (
          <div className="relative h-48 w-full overflow-hidden bg-stone-100 dark:bg-stone-800">
            <img
              src={post.cover_image}
              alt={post.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-103"
            />
          </div>
        )}

        <div className="p-5 sm:p-6">
          {/* Zero-Pill Metadata */}
          <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 mb-2.5">
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              {post.category?.name || 'Thought'}
            </span>
            <span aria-hidden="true">·</span>
            <span>{post.reading_time_minutes} min</span>
            <span aria-hidden="true">·</span>
            <span>{formattedDate}</span>
          </div>

          <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-50 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2 line-clamp-2">
            {post.title}
          </h3>

          <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed line-clamp-2 font-serif mb-4">
            {post.subtitle || post.content.slice(0, 130)}...
          </p>
        </div>
      </div>

      {/* Footer / Author & Actions */}
      <div className="px-5 sm:px-6 pb-5 pt-3 border-t border-stone-100 dark:border-stone-800/60 flex items-center justify-between mt-auto">
        <div
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(`/profile/${post.author.username}`);
          }}
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
        >
          <img
            src={post.author.avatar_url}
            alt={post.author.name}
            referrerPolicy="no-referrer"
            className="w-7 h-7 rounded-full object-cover border border-stone-200 dark:border-stone-700"
          />
          <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 truncate max-w-[120px]">
            {post.author.name}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-stone-500 dark:text-stone-400">
          <div className="flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="tabular-nums">{post.comments_count || 0}</span>
          </div>

          <button
            type="button"
            onClick={handleLike}
            className={`flex items-center gap-1 transition-colors cursor-pointer ${
              liked ? 'text-red-500 font-semibold' : 'hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-current' : ''}`} />
            <span className="tabular-nums">{likesCount}</span>
          </button>

          <button
            type="button"
            onClick={handleBookmark}
            className={`p-1 rounded-md transition-colors cursor-pointer ${
              bookmarked ? 'text-blue-600 dark:text-blue-400' : 'hover:text-stone-900 dark:hover:text-stone-200'
            }`}
            title="Bookmark"
          >
            <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>
    </article>
  );
};
