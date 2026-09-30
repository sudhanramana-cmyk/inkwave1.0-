import React, { useState, useEffect } from 'react';
import { CreatorAnalytics } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  LayoutDashboard,
  Eye,
  Heart,
  MessageSquare,
  Users,
  PenSquare,
  BookOpen,
  Edit,
  Trash2,
  TrendingUp,
  FileText
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (path: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [analytics, setAnalytics] = useState<CreatorAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const data = await api.getCreatorAnalytics();
      setAnalytics(data);
    } catch (err: any) {
      error(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const handleDelete = async (postId: string) => {
    if (!window.confirm('Delete this story permanently?')) return;
    try {
      await api.deletePost(postId);
      success('Story deleted');
      fetchAnalytics();
    } catch (err: any) {
      error(err.message || 'Delete failed');
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 animate-pulse space-y-6">
        <div className="h-8 w-48 bg-stone-200 dark:bg-stone-800 rounded" />
        <div className="grid grid-cols-4 gap-4 h-24 bg-stone-100 dark:bg-stone-900 rounded-xl" />
      </div>
    );
  }

  const stats = analytics?.stats || {
    publishedCount: 0,
    draftsCount: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    followers: 0
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-1">
            <LayoutDashboard className="w-4 h-4" />
            <span>Author Studio</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-50">
            Creator Dashboard
          </h1>
          <p className="text-sm font-serif text-stone-600 dark:text-stone-400 mt-1">
            Measure reach, track conversations, and manage your published catalogue.
          </p>
        </div>

        <button
          onClick={() => onNavigate('/write')}
          className="flex items-center gap-2 px-5 py-2.5 bg-stone-950 hover:bg-stone-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <PenSquare className="w-4 h-4" />
          <span>Write New Story</span>
        </button>
      </div>

      {/* KPI Cards (Zero pills, clean tabular figures) */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        
        <div className="p-4 rounded-xl bg-white/70 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800/80">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Stories</span>
            <BookOpen className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 tabular-nums">
            {stats.publishedCount}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white/70 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800/80">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Drafts</span>
            <FileText className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 tabular-nums">
            {stats.draftsCount}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white/70 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800/80">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Views</span>
            <Eye className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 tabular-nums">
            {stats.totalViews.toLocaleString()}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white/70 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800/80">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Appreciations</span>
            <Heart className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 tabular-nums">
            {stats.totalLikes.toLocaleString()}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white/70 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800/80">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Comments</span>
            <MessageSquare className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 tabular-nums">
            {stats.totalComments}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white/70 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800/80">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Followers</span>
            <Users className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 tabular-nums">
            {stats.followers}
          </div>
        </div>

      </div>

      {/* Visual Analytics Bar Chart: Velocity over past 7 days */}
      {analytics && analytics.timeSeries.length > 0 && (
        <div className="p-6 rounded-2xl bg-white/70 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-800 dark:text-stone-200">
                Audience Trajectory (Last 7 Days)
              </h3>
            </div>
            <div className="flex items-center gap-4 text-xs text-stone-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <span>Views</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                <span>Likes</span>
              </span>
            </div>
          </div>

          <div className="h-44 flex items-end justify-between gap-3 pt-6 pb-2 border-b border-stone-200 dark:border-stone-800">
            {analytics.timeSeries.map((item, idx) => {
              const maxView = Math.max(...analytics.timeSeries.map(t => t.views), 10);
              const heightPct = Math.max(12, Math.round((item.views / maxView) * 100));

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="text-[10px] text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                    {item.views}
                  </div>
                  <div
                    className="w-full max-w-[42px] bg-blue-600/80 hover:bg-blue-600 rounded-t-lg transition-all"
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="text-[11px] text-stone-500 font-mono">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Stories Management Table */}
      <div className="bg-white/70 dark:bg-stone-900/60 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <h3 className="font-serif font-bold text-lg text-stone-900 dark:text-stone-100">
            Recent Stories
          </h3>
          <span className="text-xs text-stone-500">
            {analytics?.recentStories.length || 0} Total Manuscripts
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50/60 dark:bg-stone-800/40 text-stone-500 uppercase tracking-wider font-semibold border-b border-stone-200 dark:border-stone-800">
              <tr>
                <th className="py-3 px-4">Story</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 tabular-nums">Views</th>
                <th className="py-3 px-4 tabular-nums">Likes</th>
                <th className="py-3 px-4 tabular-nums">Comments</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200/60 dark:divide-stone-800/60">
              {!analytics || analytics.recentStories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-stone-400">
                    No manuscripts recorded yet.
                  </td>
                </tr>
              ) : (
                analytics.recentStories.map(story => (
                  <tr key={story.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30 transition-colors">
                    <td className="py-3 px-4 font-serif font-medium text-stone-900 dark:text-stone-100 max-w-xs truncate">
                      {story.title}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`capitalize ${
                        story.status === 'published' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-amber-600 dark:text-amber-400'
                      }`}>
                        {story.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 tabular-nums text-stone-600 dark:text-stone-400">
                      {story.views.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 tabular-nums text-stone-600 dark:text-stone-400">
                      {story.likes}
                    </td>
                    <td className="py-3 px-4 tabular-nums text-stone-600 dark:text-stone-400">
                      {story.comments}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onNavigate(`/story/${story.id}`)}
                          className="text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 font-medium"
                        >
                          View
                        </button>
                        <button
                          onClick={() => onNavigate(`/edit/${story.id}`)}
                          className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(story.id)}
                          className="text-red-500 hover:text-red-700 font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
