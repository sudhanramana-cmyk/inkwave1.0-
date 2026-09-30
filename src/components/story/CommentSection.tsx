import React, { useState, useEffect } from 'react';
import { CommentWithThread } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { MessageSquare, Heart, CornerDownRight, Edit3, Trash2, Send, ChevronDown } from 'lucide-react';

interface CommentSectionProps {
  postId: string;
  onNavigate: (path: string) => void;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ postId, onNavigate }) => {
  const { user, authModal } = useAuth();
  const { success, error } = useToast();

  const [comments, setComments] = useState<CommentWithThread[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [sort, setSort] = useState<'most_liked' | 'newest' | 'oldest'>('most_liked');
  const [loading, setLoading] = useState(true);

  // New root comment
  const [newContent, setNewContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Replying state
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const fetchComments = async () => {
    try {
      const res = await api.getComments(postId, sort);
      setComments(res.comments);
      setTotalCount(res.count);
    } catch {
      // safe
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId, sort]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      authModal.open('login');
      return;
    }
    if (!newContent.trim()) return;

    setSubmitting(true);
    try {
      await api.addComment(postId, { content: newContent.trim() });
      setNewContent('');
      success('Your thought has been shared in the discussion');
      fetchComments();
    } catch (err: any) {
      error(err.message || 'Could not post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplySubmit = async (parentId: string) => {
    if (!user) {
      authModal.open('login');
      return;
    }
    if (!replyContent.trim()) return;

    try {
      await api.addComment(postId, { content: replyContent.trim(), parent_id: parentId });
      setReplyContent('');
      setReplyingToId(null);
      success('Reply posted');
      fetchComments();
    } catch (err: any) {
      error(err.message || 'Could not post reply');
    }
  };

  const handleEditSubmit = async (commentId: string) => {
    if (!editContent.trim()) return;
    try {
      await api.updateComment(commentId, editContent.trim());
      setEditingId(null);
      setEditContent('');
      success('Comment updated');
      fetchComments();
    } catch (err: any) {
      error(err.message || 'Failed to update');
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await api.deleteComment(commentId);
      success('Comment removed');
      fetchComments();
    } catch (err: any) {
      error(err.message || 'Failed to remove');
    }
  };

  const handleToggleLike = async (commentId: string) => {
    if (!user) {
      authModal.open('login');
      return;
    }
    try {
      await api.toggleCommentLike(commentId);
      fetchComments();
    } catch {
      // safe
    }
  };

  // Render individual comment card (recursive for nested replies)
  const renderComment = (comment: CommentWithThread, depth = 0) => {
    const isAuthor = user?.id === comment.author_id;
    const isAdmin = user?.role === 'admin';
    const isReplying = replyingToId === comment.id;
    const isEditing = editingId === comment.id;

    const timeAgo = new Date(comment.created_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });

    return (
      <div
        key={comment.id}
        className={`group relative ${
          depth > 0 ? 'ml-4 sm:ml-8 pl-4 border-l-2 border-stone-200/80 dark:border-stone-800/80 mt-4' : 'mt-6'
        }`}
      >
        <div className="bg-white/50 dark:bg-stone-900/40 p-4 sm:p-5 rounded-xl border border-stone-200/60 dark:border-stone-800/60 transition-colors">
          {/* Header */}
          <div className="flex items-center justify-between mb-2.5">
            <div
              onClick={() => onNavigate(`/profile/${comment.author.username}`)}
              className="flex items-center gap-2.5 cursor-pointer hover:opacity-80"
            >
              <img
                src={comment.author.avatar_url}
                alt={comment.author.name}
                referrerPolicy="no-referrer"
                className="w-7 h-7 rounded-full object-cover border border-stone-300 dark:border-stone-700"
              />
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                  {comment.author.name}
                </span>
                <span className="text-[11px] text-stone-400">@{comment.author.username}</span>
                <span className="text-stone-300 dark:text-stone-700">·</span>
                <span className="text-[11px] text-stone-400">{timeAgo}</span>
              </div>
            </div>

            {/* Actions for owner/admin */}
            {(isAuthor || isAdmin) && (
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                {isAuthor && (
                  <button
                    onClick={() => {
                      setEditingId(comment.id);
                      setEditContent(comment.content);
                    }}
                    className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-1"
                    title="Edit comment"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="text-stone-400 hover:text-red-500 p-1"
                  title="Remove comment"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Content or Edit Form */}
          {isEditing ? (
            <div className="mt-2 space-y-2">
              <textarea
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                rows={2}
                className="w-full p-2.5 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEditSubmit(comment.id)}
                  className="px-3 py-1 bg-stone-900 dark:bg-blue-600 text-white rounded-md text-xs font-medium"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="px-3 py-1 text-xs text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs sm:text-sm text-stone-800 dark:text-stone-200 leading-relaxed font-sans font-normal whitespace-pre-line">
              {comment.content}
            </p>
          )}

          {/* Footer toolbar */}
          <div className="flex items-center gap-4 mt-3 pt-2 text-xs text-stone-500 dark:text-stone-400">
            <button
              onClick={() => handleToggleLike(comment.id)}
              className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                comment.user_liked ? 'text-red-500 font-semibold' : 'hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${comment.user_liked ? 'fill-current' : ''}`} />
              <span className="tabular-nums">{comment.likes_count}</span>
            </button>

            {depth < 3 && (
              <button
                onClick={() => {
                  if (!user) authModal.open('login');
                  else setReplyingToId(isReplying ? null : comment.id);
                }}
                className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
              >
                <CornerDownRight className="w-3.5 h-3.5" />
                <span>Reply</span>
              </button>
            )}
          </div>
        </div>

        {/* Reply input drawer */}
        {isReplying && (
          <div className="mt-3 ml-4 sm:ml-8 pl-4 border-l-2 border-blue-400">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={replyContent}
                onChange={e => setReplyContent(e.target.value)}
                placeholder={`Replying to @${comment.author.username}...`}
                className="flex-1 px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                onKeyDown={e => {
                  if (e.key === 'Enter') handleReplySubmit(comment.id);
                }}
              />
              <button
                onClick={() => handleReplySubmit(comment.id)}
                className="px-3 py-2 bg-stone-900 dark:bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-stone-800 dark:hover:bg-blue-500 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setReplyingToId(null)}
                className="text-xs text-stone-400 hover:text-stone-600 px-2"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Nested replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="space-y-1">
            {comment.replies.map(reply => renderComment(reply, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <section className="mt-16 pt-12 border-t border-stone-200 dark:border-stone-800 max-w-3xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Threaded Discussion</span>
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            {totalCount === 0 ? 'Be the first to begin the inquiry.' : `${totalCount} people are discussing this thought.`}
          </p>
        </div>

        {/* Sort Filter Tab */}
        <div className="flex items-center gap-1 p-1 bg-stone-100 dark:bg-stone-900 rounded-lg text-xs font-medium">
          <button
            onClick={() => setSort('most_liked')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              sort === 'most_liked'
                ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-xs'
                : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            Most Liked
          </button>
          <button
            onClick={() => setSort('newest')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              sort === 'newest'
                ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-xs'
                : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            Newest
          </button>
          <button
            onClick={() => setSort('oldest')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              sort === 'oldest'
                ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-xs'
                : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            Oldest
          </button>
        </div>
      </div>

      {/* Primary Comment Input */}
      <form onSubmit={handleAddComment} className="mb-10">
        <div className="bg-white/80 dark:bg-stone-900/60 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-xs">
          <textarea
            value={newContent}
            onChange={e => setNewContent(e.target.value)}
            placeholder={user ? "Write a considered reflection or counterpoint..." : "Sign in to participate in this discussion..."}
            rows={3}
            className="w-full bg-transparent text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none resize-none leading-relaxed font-sans"
          />
          <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-stone-800/80">
            <span className="text-[11px] text-stone-400">
              Markdown permitted. Keep discussions civil and substantive.
            </span>
            <button
              type="submit"
              disabled={submitting || !newContent.trim()}
              className="px-4 py-1.5 bg-stone-950 hover:bg-stone-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-40 cursor-pointer"
            >
              {submitting ? 'Publishing...' : 'Add Thought'}
            </button>
          </div>
        </div>
      </form>

      {/* Discussion List */}
      {loading ? (
        <div className="py-12 text-center text-xs text-stone-400">
          Loading discussion threads...
        </div>
      ) : comments.length === 0 ? (
        <div className="py-12 text-center bg-stone-50/50 dark:bg-stone-900/20 rounded-xl border border-dashed border-stone-300 dark:border-stone-800 p-8">
          <p className="text-sm font-serif text-stone-700 dark:text-stone-300">
            No reflections yet.
          </p>
          <p className="text-xs text-stone-400 mt-1">
            Every meaningful conversation begins with an initial voice.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-stone-100 dark:divide-stone-800/40">
          {comments.map(c => renderComment(c, 0))}
        </div>
      )}
    </section>
  );
};
