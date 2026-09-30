import React, { useEffect, useState } from 'react';
import { PostWithDetails, ReactionType } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ReactionPicker } from '../components/story/ReactionPicker';
import { CommentSection } from '../components/story/CommentSection';
import { TableOfContents } from '../components/story/TableOfContents';
import { StoryCard } from '../components/story/StoryCard';
import {
  Heart,
  Bookmark,
  Share2,
  Clock,
  Calendar,
  Eye,
  UserPlus,
  UserCheck,
  Edit,
  Trash2,
  ArrowLeft
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface StoryPageProps {
  postId: string;
  onNavigate: (path: string) => void;
  onOpenShare: (title: string, url: string) => void;
}

export const StoryPage: React.FC<StoryPageProps> = ({ postId, onNavigate, onOpenShare }) => {
  const { user, authModal } = useAuth();
  const { success, error } = useToast();

  const [post, setPost] = useState<PostWithDetails | null>(null);
  const [related, setRelated] = useState<PostWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Author follow state
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // Reading progress tracker
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight <= 0) {
        setScrollProgress(0);
        return;
      }
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(Math.min(100, Math.max(0, progress)));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch story details & related
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);

    api.getPost(postId)
      .then(res => {
        if (!isCancelled) {
          setPost(res.post);
          // Check follow status
          if (user && res.post.author_id !== user.id) {
            api.getUserProfile(res.post.author.username).then(prof => {
              if (!isCancelled) setIsFollowing(prof.is_following);
            }).catch(() => {});
          }
        }
      })
      .catch(err => {
        if (!isCancelled) error(err.message || 'Story could not be loaded');
      })
      .finally(() => {
        if (!isCancelled) setLoading(false);
      });

    api.getRelatedPosts(postId)
      .then(res => {
        if (!isCancelled) setRelated(res.related);
      })
      .catch(() => {});

    return () => {
      isCancelled = true;
    };
  }, [postId, user]);

  const handleLike = async () => {
    if (!user) {
      authModal.open('login');
      return;
    }
    if (!post) return;

    // Confetti burst
    if (!post.user_liked) {
      try {
        confetti({
          particleCount: 20,
          spread: 50,
          origin: { x: 0.5, y: 0.8 },
          colors: ['#ef4444', '#f97316'],
          disableForReducedMotion: true
        });
      } catch {}
    }

    try {
      const res = await api.toggleLike(post.id);
      setPost(prev => prev ? {
        ...prev,
        user_liked: res.liked,
        likes_count: res.count
      } : null);
    } catch {
      // safe
    }
  };

  const handleReaction = async (type: ReactionType) => {
    if (!user) {
      authModal.open('login');
      return;
    }
    if (!post) return;

    try {
      const res = await api.setReaction(post.id, type);
      setPost(prev => prev ? {
        ...prev,
        user_reaction: res.reaction,
        reaction_counts: res.counts
      } : null);
    } catch {
      // safe
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      authModal.open('login');
      return;
    }
    if (!post) return;

    try {
      const res = await api.toggleBookmark(post.id, 'recently_saved');
      setPost(prev => prev ? {
        ...prev,
        user_bookmarked: res.bookmarked,
        user_shelf: res.folder
      } : null);
      if (res.bookmarked) {
        success('Added to your Reading Shelf');
      } else {
        success('Removed from shelf');
      }
    } catch {
      // safe
    }
  };

  const handleFollowToggle = async () => {
    if (!user) {
      authModal.open('login');
      return;
    }
    if (!post) return;

    setFollowLoading(true);
    try {
      const res = await api.toggleFollow(post.author_id, isFollowing);
      setIsFollowing(res.following);
      success(res.following ? `Now following ${post.author.name}'s wave` : `Unfollowed ${post.author.name}`);
    } catch (err: any) {
      error(err.message || 'Follow action failed');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleDeletePost = async () => {
    if (!post) return;
    if (!window.confirm('Are you sure you want to permanently delete this story?')) return;

    try {
      await api.deletePost(post.id);
      success('Story removed successfully');
      onNavigate('/');
    } catch (err: any) {
      error(err.message || 'Delete failed');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 animate-pulse space-y-6">
        <div className="h-6 w-32 bg-stone-200 dark:bg-stone-800 rounded" />
        <div className="h-12 w-3/4 bg-stone-200 dark:bg-stone-800 rounded" />
        <div className="h-6 w-1/2 bg-stone-200 dark:bg-stone-800 rounded" />
        <div className="h-72 w-full bg-stone-200 dark:bg-stone-800 rounded-2xl" />
        <div className="space-y-3">
          <div className="h-4 w-full bg-stone-200 dark:bg-stone-800 rounded" />
          <div className="h-4 w-5/6 bg-stone-200 dark:bg-stone-800 rounded" />
          <div className="h-4 w-4/6 bg-stone-200 dark:bg-stone-800 rounded" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 mb-2">
          Story Not Found
        </h2>
        <p className="text-sm text-stone-500 mb-6">
          The requested essay may have been removed or relocated to private archives.
        </p>
        <button
          onClick={() => onNavigate('/')}
          className="px-4 py-2 bg-stone-900 dark:bg-blue-600 text-white rounded-lg text-xs font-semibold"
        >
          Return Home
        </button>
      </div>
    );
  }

  const isAuthor = user?.id === post.author_id;
  const isAdmin = user?.role === 'admin';
  const formattedDate = new Date(post.published_at || post.created_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div>
      {/* 1. Reading Progress Bar fixed at top */}
      <div
        className="fixed top-16 left-0 right-0 h-1 bg-transparent z-50 pointer-events-none"
      >
        <div
          className="h-full bg-blue-600 dark:bg-blue-400 transition-all duration-75 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* Back navigation */}
        <button
          onClick={() => onNavigate('/')}
          className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition-colors mb-8 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to ideas</span>
        </button>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
          
          {/* Main Reading Column */}
          <main className="xl:col-span-9 max-w-3xl">
            
            {/* Metadata (Zero-pill discipline) */}
            <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 mb-4 font-sans">
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {post.category?.name || 'Inquiry'}
              </span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {post.reading_time_minutes} min read
              </span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formattedDate}
              </span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {post.views_count.toLocaleString()} views
              </span>
            </div>

            {/* Title & Subtitle */}
            <h1 className="text-3xl sm:text-5xl font-serif font-bold text-stone-950 dark:text-stone-50 leading-[1.15] tracking-tight mb-4 text-balance">
              {post.title}
            </h1>

            {post.subtitle && (
              <p className="text-lg sm:text-xl font-serif text-stone-600 dark:text-stone-300 leading-relaxed mb-8">
                {post.subtitle}
              </p>
            )}

            {/* Author Byline Ribbon */}
            <div className="flex items-center justify-between py-4 border-y border-stone-200 dark:border-stone-800 mb-8">
              <div
                onClick={() => onNavigate(`/profile/${post.author.username}`)}
                className="flex items-center gap-3.5 cursor-pointer hover:opacity-85 transition-opacity"
              >
                <img
                  src={post.author.avatar_url}
                  alt={post.author.name}
                  referrerPolicy="no-referrer"
                  className="w-11 h-11 rounded-full object-cover border border-stone-300 dark:border-stone-700"
                />
                <div>
                  <div className="text-sm font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                    <span>{post.author.name}</span>
                    {post.author.reading_streak > 3 && (
                      <span className="text-[10px] text-amber-700 dark:text-amber-400 font-sans">
                        ⚡ {post.author.reading_streak}d streak
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-stone-500 font-sans line-clamp-1 max-w-xs">
                    {post.author.bio || `@${post.author.username}`}
                  </div>
                </div>
              </div>

              {/* Author Actions */}
              <div className="flex items-center gap-2">
                {user && user.id !== post.author_id && (
                  <button
                    onClick={handleFollowToggle}
                    disabled={followLoading}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      isFollowing
                        ? 'border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600'
                        : 'bg-stone-900 dark:bg-blue-600 text-white hover:bg-stone-800 dark:hover:bg-blue-500'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Follow</span>
                      </>
                    )}
                  </button>
                )}

                {(isAuthor || isAdmin) && (
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={() => onNavigate(`/edit/${post.id}`)}
                      className="p-1.5 text-stone-500 hover:text-stone-900 dark:hover:text-stone-200 rounded-md border border-stone-200 dark:border-stone-800"
                      title="Edit story"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={handleDeletePost}
                      className="p-1.5 text-red-500 hover:text-red-700 rounded-md border border-stone-200 dark:border-stone-800"
                      title="Delete story"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Cover image */}
            {post.cover_image && (
              <figure className="mb-10 rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800/80 shadow-xs">
                <img
                  src={post.cover_image}
                  alt={post.title}
                  referrerPolicy="no-referrer"
                  className="w-full max-h-[480px] object-cover"
                />
              </figure>
            )}

            {/* Article Prose Body with Drop-cap */}
            <div className="prose prose-stone dark:prose-invert max-w-none text-base sm:text-lg leading-[1.8] text-stone-800 dark:text-stone-200 font-serif">
              {post.content.split('\n\n').map((paragraph, index) => {
                // If it's a heading
                if (paragraph.startsWith('### ')) {
                  const headingText = paragraph.replace('### ', '');
                  const headingId = headingText.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                  return (
                    <h3
                      key={index}
                      id={headingId}
                      className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 mt-10 mb-4 pt-4 border-t border-stone-200/60 dark:border-stone-800/60"
                    >
                      {headingText}
                    </h3>
                  );
                }

                // If blockquote
                if (paragraph.startsWith('> ')) {
                  return (
                    <blockquote
                      key={index}
                      className="my-6 pl-5 border-l-3 border-blue-600 dark:border-blue-400 italic text-xl font-serif text-stone-700 dark:text-stone-300"
                    >
                      {paragraph.replace('> ', '')}
                    </blockquote>
                  );
                }

                // If code block
                if (paragraph.startsWith('```')) {
                  const code = paragraph.replace(/```[a-z]*\n?/, '').replace(/```$/, '');
                  return (
                    <pre
                      key={index}
                      className="my-6 p-4 rounded-xl bg-stone-950 text-stone-200 font-mono text-xs overflow-x-auto border border-stone-800"
                    >
                      <code>{code}</code>
                    </pre>
                  );
                }

                // First paragraph with editorial drop cap
                if (index === 0) {
                  return (
                    <p key={index} className="editorial-drop-cap mb-6">
                      {paragraph}
                    </p>
                  );
                }

                return (
                  <p key={index} className="mb-6">
                    {paragraph}
                  </p>
                );
              })}
            </div>

            {/* Tags footer */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-10 pt-6 border-t border-stone-200 dark:border-stone-800 flex items-center gap-2 flex-wrap">
                <span className="text-xs uppercase tracking-wider text-stone-400 font-semibold mr-2">
                  Themes:
                </span>
                {post.tags.map(t => (
                  <span
                    key={t.id}
                    className="text-xs text-stone-600 dark:text-stone-400 font-sans hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                    onClick={() => onNavigate(`/discover?tag=${t.slug}`)}
                  >
                    #{t.name}
                  </span>
                ))}
              </div>
            )}

            {/* Reactions & Sticky Interactions Box */}
            <div className="my-10 p-6 rounded-2xl bg-stone-100/70 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">
                  What did this spark in you?
                </div>
                <ReactionPicker
                  counts={post.reaction_counts}
                  userReaction={post.user_reaction}
                  onReact={handleReaction}
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    post.user_liked
                      ? 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-900'
                      : 'bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-50'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${post.user_liked ? 'fill-current' : ''}`} />
                  <span>{post.likes_count} Likes</span>
                </button>

                <button
                  onClick={handleBookmark}
                  className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                    post.user_bookmarked
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-900'
                      : 'bg-white dark:bg-stone-800 border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50'
                  }`}
                  title="Bookmark story"
                >
                  <Bookmark className={`w-4 h-4 ${post.user_bookmarked ? 'fill-current' : ''}`} />
                </button>

                <button
                  onClick={() => onOpenShare(post.title, window.location.href)}
                  className="p-2 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50 cursor-pointer"
                  title="Share story"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Comments / Threaded Discussion Section */}
            <CommentSection postId={post.id} onNavigate={onNavigate} />

          </main>

          {/* Right Floating Sidebar: Table of Contents & Author Card */}
          <aside className="xl:col-span-3 space-y-6">
            <TableOfContents content={post.content} />

            {/* Author card */}
            <div className="p-5 bg-white/60 dark:bg-stone-900/40 rounded-xl border border-stone-200/80 dark:border-stone-800/80 text-xs">
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={post.author.avatar_url}
                  alt={post.author.name}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-full object-cover border border-stone-300 dark:border-stone-700"
                />
                <div>
                  <div className="font-semibold text-stone-900 dark:text-stone-100 text-sm">
                    {post.author.name}
                  </div>
                  <div className="text-stone-500">@{post.author.username}</div>
                </div>
              </div>
              <p className="text-stone-600 dark:text-stone-300 leading-relaxed font-serif mb-4">
                {post.author.bio || 'Essayist and contributor on INKWAVE.'}
              </p>
              <button
                onClick={() => onNavigate(`/profile/${post.author.username}`)}
                className="w-full py-1.5 text-center text-xs font-semibold text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg transition-colors cursor-pointer"
              >
                View Writer Profile
              </button>
            </div>
          </aside>

        </div>

        {/* Continue Reading Section (Related Stories) */}
        {related.length > 0 && (
          <section className="mt-20 pt-12 border-t border-stone-200 dark:border-stone-800">
            <div className="mb-8">
              <div className="text-xs uppercase tracking-widest font-semibold text-stone-400 mb-1">
                Connected Resonances
              </div>
              <h3 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
                Continue Reading
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map(r => (
                <StoryCard
                  key={r.id}
                  post={r}
                  onNavigate={onNavigate}
                  onOpenShare={onOpenShare}
                  layout="standard"
                />
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
};
