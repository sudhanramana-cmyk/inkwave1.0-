import React, { useState, useEffect } from 'react';
import { UserPublic, PostWithDetails } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Shield, Users, BookOpen, Trash2, Ban, CheckCircle, AlertTriangle } from 'lucide-react';

interface AdminPageProps {
  onNavigate: (path: string) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [users, setUsers] = useState<UserPublic[]>([]);
  const [posts, setPosts] = useState<PostWithDetails[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'posts'>('users');
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [uRes, pRes] = await Promise.all([
        api.getAdminUsers(),
        api.getPosts({ limit: 100 })
      ]);
      setUsers(uRes.users);
      setPosts(pRes.posts);
    } catch (err: any) {
      error(err.message || 'Failed to load moderator records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchAdminData();
    }
  }, [user]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <Shield className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 mb-2">
          Moderation Restricted
        </h2>
        <p className="text-xs text-stone-500 mb-6">
          This portal requires lead curator credentials. Sign in as Arjun Mehta (`admin`) to access.
        </p>
        <button
          onClick={() => onNavigate('/')}
          className="px-4 py-2 bg-stone-900 dark:bg-blue-600 text-white rounded-lg text-xs font-semibold"
        >
          Return to Platform
        </button>
      </div>
    );
  }

  const handleToggleSuspend = async (userId: string) => {
    try {
      const res = await api.toggleSuspendUser(userId);
      setUsers(prev => prev.map(u => u.id === userId ? res.user : u));
      success(res.user.is_suspended ? 'Member account suspended' : 'Member reinstated');
    } catch (err: any) {
      error(err.message || 'Action failed');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('Moderator notice: Remove this story entirely?')) return;
    try {
      await api.adminDeletePost(postId);
      setPosts(prev => prev.filter(p => p.id !== postId));
      success('Story removed from registry');
    } catch (err: any) {
      error(err.message || 'Failed to remove story');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-red-600 dark:text-red-400 mb-1">
            <Shield className="w-4 h-4" />
            <span>Curatorial Oversight</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-stone-900 dark:text-stone-50">
            Moderator Panel
          </h1>
          <p className="text-sm font-serif text-stone-600 dark:text-stone-400 mt-1">
            Manage user accounts, maintain discourse standards, and enforce platform guidelines.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 dark:border-stone-800">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 text-xs font-semibold transition-colors border-b-2 mr-8 cursor-pointer flex items-center gap-2 ${
            activeTab === 'users'
              ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Members Directory ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('posts')}
          className={`pb-3 text-xs font-semibold transition-colors border-b-2 cursor-pointer flex items-center gap-2 ${
            activeTab === 'posts'
              ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Manuscripts ({posts.length})</span>
        </button>
      </div>

      {loading ? (
        <div className="h-64 rounded-xl bg-stone-100 dark:bg-stone-800/40 animate-pulse" />
      ) : activeTab === 'users' ? (
        /* USERS DIRECTORY TABLE */
        <div className="bg-white/70 dark:bg-stone-900/60 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50/60 dark:bg-stone-800/40 text-stone-500 uppercase tracking-wider font-semibold border-b border-stone-200 dark:border-stone-800">
              <tr>
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200/60 dark:divide-stone-800/60">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30">
                  <td className="py-3 px-4 flex items-center gap-3">
                    <img
                      src={u.avatar_url}
                      alt={u.name}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-semibold text-stone-900 dark:text-stone-100">{u.name}</div>
                      <div className="text-[10px] text-stone-400">@{u.username}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-stone-600 dark:text-stone-400 font-mono text-[11px]">
                    {u.email}
                  </td>
                  <td className="py-3 px-4 uppercase text-[10px] font-semibold text-stone-500">
                    {u.role}
                  </td>
                  <td className="py-3 px-4">
                    {u.is_suspended ? (
                      <span className="text-red-500 font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Suspended
                      </span>
                    ) : (
                      <span className="text-emerald-500 font-medium flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Good Standing
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {u.role !== 'admin' && (
                      <button
                        onClick={() => handleToggleSuspend(u.id)}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                          u.is_suspended
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300'
                            : 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-300'
                        }`}
                      >
                        {u.is_suspended ? 'Reinstate' : 'Suspend'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* POSTS MODERATION TABLE */
        <div className="bg-white/70 dark:bg-stone-900/60 rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50/60 dark:bg-stone-800/40 text-stone-500 uppercase tracking-wider font-semibold border-b border-stone-200 dark:border-stone-800">
              <tr>
                <th className="py-3 px-4">Story</th>
                <th className="py-3 px-4">Author</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 tabular-nums">Views</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200/60 dark:divide-stone-800/60">
              {posts.map(p => (
                <tr key={p.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30">
                  <td className="py-3 px-4 font-serif font-medium text-stone-900 dark:text-stone-100 max-w-sm truncate">
                    {p.title}
                  </td>
                  <td className="py-3 px-4 text-stone-600 dark:text-stone-400">
                    {p.author.name}
                  </td>
                  <td className="py-3 px-4 text-stone-500">
                    {p.category?.name}
                  </td>
                  <td className="py-3 px-4 tabular-nums text-stone-600 dark:text-stone-400">
                    {p.views_count.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDeletePost(p.id)}
                      className="text-red-500 hover:text-red-700 font-medium px-2 py-1"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};
