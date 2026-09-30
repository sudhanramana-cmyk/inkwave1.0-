import React, { useState, useEffect } from 'react';
import { UserPublic, PostWithDetails } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { StoryCard } from '../components/story/StoryCard';
import {
  Calendar,
  BookOpen,
  Heart,
  Users,
  UserPlus,
  UserCheck,
  Edit3,
  Bookmark,
  MessageSquare,
  Sparkles,
  X
} from 'lucide-react';

interface ProfilePageProps {
  username: string;
  onNavigate: (path: string) => void;
  onOpenShare: (title: string, url: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ username, onNavigate, onOpenShare }) => {
  const { user: currentUser, updateUser, authModal } = useAuth();
  const { success, error } = useToast();

  const [profileUser, setProfileUser] = useState<UserPublic | null>(null);
  const [stats, setStats] = useState<{ followersCount: number; followingCount: number; postsCount: number; totalLikes: number }>({
    followersCount: 0,
    followingCount: 0,
    postsCount: 0,
    totalLikes: 0
  });
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  // Tabs: 'stories' | 'saved' | 'about'
  const [activeTab, setActiveTab] = useState<'stories' | 'saved' | 'about'>('stories');
  const [stories, setStories] = useState<PostWithDetails[]>([]);
  const [savedStories, setSavedStories] = useState<PostWithDetails[]>([]);

  // Edit Modal State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    setLoading(true);

    api.getUserProfile(username)
      .then(res => {
        if (!isCancelled) {
          setProfileUser(res.user);
          setStats(res.stats);
          setIsFollowing(res.is_following);
          setEditName(res.user.name);
          setEditBio(res.user.bio);
          setEditUsername(res.user.username);
          setEditAvatar(res.user.avatar_url);

          // Fetch stories
          api.getPosts({ author: res.user.username })
            .then(postsRes => {
              if (!isCancelled) setStories(postsRes.posts);
            })
            .catch(() => {});

          // If current user is viewing own profile, also fetch saved stories
          if (currentUser && currentUser.username === res.user.username) {
            api.getBookmarks()
              .then(bmkRes => {
                if (!isCancelled) setSavedStories(bmkRes.posts);
              })
              .catch(() => {});
          }
        }
      })
      .catch(err => {
        if (!isCancelled) error(err.message || 'Profile could not be loaded');
      })
      .finally(() => {
        if (!isCancelled) setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [username, currentUser]);

  const handleFollowToggle = async () => {
    if (!currentUser) {
      authModal.open('login');
      return;
    }
    if (!profileUser) return;

    setFollowLoading(true);
    try {
      const res = await api.toggleFollow(profileUser.id, isFollowing);
      setIsFollowing(res.following);
      setStats(prev => ({
        ...prev,
        followersCount: res.followersCount
      }));
      success(res.following ? `Following ${profileUser.name}` : `Unfollowed ${profileUser.name}`);
    } catch (err: any) {
      error(err.message || 'Follow action failed');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileUser) return;

    setSavingProfile(true);
    try {
      const res = await api.updateUserProfile(profileUser.id, {
        name: editName,
        bio: editBio,
        username: editUsername,
        avatar_url: editAvatar
      });
      setProfileUser(res.user);
      updateUser(res.user);
      setIsEditingProfile(false);
      success('Profile updated successfully');
      if (editUsername !== username) {
        onNavigate(`/profile/${editUsername}`);
      }
    } catch (err: any) {
      error(err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 animate-pulse space-y-6">
        <div className="h-32 bg-stone-200 dark:bg-stone-800 rounded-2xl" />
        <div className="h-6 w-48 bg-stone-200 dark:bg-stone-800 rounded" />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-stone-100 mb-2">
          Writer Not Found
        </h2>
        <p className="text-sm text-stone-500 mb-6">
          The requested member could not be located on INKWAVE.
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

  const isOwnProfile = currentUser?.id === profileUser.id;
  const joinDate = new Date(profileUser.created_at).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* 1. VISUALLY UNIQUE PROFILE HEADER */}
      <div className="relative rounded-3xl p-6 sm:p-10 bg-gradient-to-br from-stone-100 to-stone-50 dark:from-stone-900 dark:to-[#080C16] border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
        
        {/* Subtle background ambient mesh */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          {/* Avatar & Core Bio */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <img
              src={profileUser.avatar_url}
              alt={profileUser.name}
              referrerPolicy="no-referrer"
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-white dark:border-stone-800 shadow-md"
            />
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-950 dark:text-white">
                  {profileUser.name}
                </h1>
                {profileUser.reading_streak > 0 && (
                  <span className="text-[11px] font-sans font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/40">
                    ⚡ {profileUser.reading_streak}d Streak
                  </span>
                )}
              </div>

              <div className="text-xs text-stone-500 font-mono">
                @{profileUser.username} · Joined {joinDate}
              </div>

              <p className="text-sm font-serif text-stone-600 dark:text-stone-300 max-w-xl leading-relaxed pt-1">
                {profileUser.bio || 'Contributing essays and thoughtful inquiries to the INKWAVE guild.'}
              </p>
            </div>
          </div>

          {/* Action Button: Edit or Follow */}
          <div className="flex items-center gap-3">
            {isOwnProfile ? (
              <button
                onClick={() => setIsEditingProfile(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-semibold rounded-xl border border-stone-300 dark:border-stone-700 shadow-xs transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <button
                onClick={handleFollowToggle}
                disabled={followLoading}
                className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer ${
                  isFollowing
                    ? 'border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600'
                    : 'bg-stone-950 hover:bg-stone-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white'
                }`}
              >
                {isFollowing ? (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>Following Wave</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Follow Wave</span>
                  </>
                )}
              </button>
            )}
          </div>

        </div>

        {/* Numeric stats ribbon */}
        <div className="mt-8 pt-6 border-t border-stone-200/80 dark:border-stone-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center sm:text-left">
          <div>
            <div className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100 tabular-nums">
              {stats.postsCount}
            </div>
            <div className="text-xs text-stone-500">Stories Published</div>
          </div>
          <div>
            <div className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100 tabular-nums">
              {stats.followersCount}
            </div>
            <div className="text-xs text-stone-500">Followers</div>
          </div>
          <div>
            <div className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100 tabular-nums">
              {stats.followingCount}
            </div>
            <div className="text-xs text-stone-500">Following</div>
          </div>
          <div>
            <div className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100 tabular-nums">
              {stats.totalLikes}
            </div>
            <div className="text-xs text-stone-500">Appreciations</div>
          </div>
        </div>

      </div>

      {/* 2. PROFILE TABS (Stories, Saved, About) */}
      <div>
        <div className="flex border-b border-stone-200 dark:border-stone-800 mb-8">
          <button
            onClick={() => setActiveTab('stories')}
            className={`pb-3 text-sm font-semibold transition-colors border-b-2 mr-8 cursor-pointer ${
              activeTab === 'stories'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            Stories ({stories.length})
          </button>

          {isOwnProfile && (
            <button
              onClick={() => setActiveTab('saved')}
              className={`pb-3 text-sm font-semibold transition-colors border-b-2 mr-8 cursor-pointer ${
                activeTab === 'saved'
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              Saved Shelf ({savedStories.length})
            </button>
          )}

          <button
            onClick={() => setActiveTab('about')}
            className={`pb-3 text-sm font-semibold transition-colors border-b-2 cursor-pointer ${
              activeTab === 'about'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            About
          </button>
        </div>

        {/* Tab 1: Stories */}
        {activeTab === 'stories' && (
          <div>
            {stories.length === 0 ? (
              <div className="py-16 text-center bg-stone-50/50 dark:bg-stone-900/30 rounded-2xl border border-dashed border-stone-300 dark:border-stone-800 p-8">
                <p className="text-base font-serif text-stone-700 dark:text-stone-300">
                  No stories published yet.
                </p>
                {isOwnProfile && (
                  <button
                    onClick={() => onNavigate('/write')}
                    className="mt-4 px-4 py-2 bg-stone-900 dark:bg-blue-600 text-white rounded-lg text-xs font-semibold"
                  >
                    Draft your first thought
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stories.map(post => (
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
        )}

        {/* Tab 2: Saved Shelf */}
        {activeTab === 'saved' && (
          <div>
            {savedStories.length === 0 ? (
              <div className="py-16 text-center bg-stone-50/50 dark:bg-stone-900/30 rounded-2xl border border-dashed border-stone-300 dark:border-stone-800 p-8">
                <p className="text-base font-serif text-stone-700 dark:text-stone-300">
                  Your reading shelf is empty.
                </p>
                <p className="text-xs text-stone-500 mt-1">
                  Click the bookmark icon on any story to save it for contemplative reading later.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedStories.map(post => (
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
        )}

        {/* Tab 3: About */}
        {activeTab === 'about' && (
          <div className="max-w-2xl bg-white/70 dark:bg-stone-900/60 p-8 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-6">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-400 mb-2">
                Biographical Note
              </h3>
              <p className="font-serif text-base text-stone-800 dark:text-stone-200 leading-relaxed">
                {profileUser.bio || 'This member has not yet published an extended biography.'}
              </p>
            </div>

            <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500">
              <span>Account Status: Active Member</span>
              <span>Member ID: {profileUser.id}</span>
            </div>
          </div>
        )}

      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-[#FBF9F5] dark:bg-[#0E1526] border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xl p-6 sm:p-8">
            <button
              onClick={() => setIsEditingProfile(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-serif font-bold text-stone-900 dark:text-stone-100 mb-5">
              Edit Your Profile
            </h3>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={editUsername}
                  onChange={e => setEditUsername(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Avatar Photo URL
                </label>
                <input
                  type="text"
                  value={editAvatar}
                  onChange={e => setEditAvatar(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Bio / Philosophy
                </label>
                <textarea
                  value={editBio}
                  onChange={e => setEditBio(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none resize-none font-serif"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 text-xs text-stone-600 hover:text-stone-800 dark:text-stone-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-5 py-2 bg-stone-950 dark:bg-blue-600 text-white rounded-lg text-xs font-semibold hover:opacity-90 disabled:opacity-50"
                >
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
