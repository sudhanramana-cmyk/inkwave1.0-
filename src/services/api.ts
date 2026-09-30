import {
  UserPublic,
  PostWithDetails,
  CommentWithThread,
  NotificationItem,
  CreatorAnalytics,
  Category,
  Tag,
  ReactionType,
  ShelfFolder
} from '../types';

const TOKEN_KEY = 'inkwave_auth_token';

export const authStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clearToken: () => localStorage.removeItem(TOKEN_KEY)
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = authStorage.getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  register: (payload: { name: string; username: string; email: string; password: string; avatar_url?: string }) =>
    request<{ user: UserPublic; token: string; message: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  login: (payload: { identifier: string; password: string }) =>
    request<{ user: UserPublic; token: string; message: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  logout: () =>
    request<{ message: string }>('/api/auth/logout', { method: 'POST' }),

  getMe: () =>
    request<{ user: UserPublic }>('/api/auth/me'),

  forgotPassword: (email: string) =>
    request<{ message: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    }),

  resetPassword: (payload: { email: string; new_password: string }) =>
    request<{ message: string }>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  // Meta
  getCategories: () =>
    request<Category[]>('/api/categories'),

  getTags: () =>
    request<Tag[]>('/api/tags'),

  // Posts
  getPosts: (params?: {
    category?: string;
    tag?: string;
    author?: string;
    search?: string;
    sort?: 'trending' | 'newest' | 'popular' | 'deep_reads' | 'quick_reads';
    status?: string;
    feed?: string;
    limit?: number;
    offset?: number;
  }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') query.append(k, String(v));
      });
    }
    const qStr = query.toString();
    return request<{ posts: PostWithDetails[]; total: number }>(`/api/posts${qStr ? `?${qStr}` : ''}`);
  },

  getPost: (id: string) =>
    request<{ post: PostWithDetails }>(`/api/posts/${id}`),

  getRelatedPosts: (id: string) =>
    request<{ related: PostWithDetails[] }>(`/api/posts/${id}/related`),

  createPost: (payload: {
    title: string;
    subtitle?: string;
    content: string;
    cover_image?: string;
    category_id: string;
    tags: string[];
    status?: 'published' | 'draft';
  }) =>
    request<{ post: PostWithDetails }>('/api/posts', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  updatePost: (id: string, payload: Partial<{
    title: string;
    subtitle: string;
    content: string;
    cover_image: string;
    category_id: string;
    tags: string[];
    status: 'published' | 'draft' | 'archived';
  }>) =>
    request<{ post: PostWithDetails }>(`/api/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    }),

  deletePost: (id: string) =>
    request<{ message: string }>(`/api/posts/${id}`, {
      method: 'DELETE'
    }),

  // Interactions
  toggleLike: (postId: string) =>
    request<{ liked: boolean; count: number }>(`/api/posts/${postId}/like`, { method: 'POST' }),

  setReaction: (postId: string, type: ReactionType) =>
    request<{ reaction: ReactionType | null; counts: Record<ReactionType, number> }>(`/api/posts/${postId}/reaction`, {
      method: 'POST',
      body: JSON.stringify({ type })
    }),

  toggleBookmark: (postId: string, folder: ShelfFolder = 'recently_saved') =>
    request<{ bookmarked: boolean; folder: ShelfFolder | null }>(`/api/posts/${postId}/bookmark`, {
      method: 'POST',
      body: JSON.stringify({ folder })
    }),

  getBookmarks: (folder?: ShelfFolder) => {
    const q = folder ? `?folder=${folder}` : '';
    return request<{ posts: PostWithDetails[] }>(`/api/bookmarks${q}`);
  },

  // Comments
  getComments: (postId: string, sort: 'most_liked' | 'newest' | 'oldest' = 'most_liked') =>
    request<{ comments: CommentWithThread[]; count: number }>(`/api/posts/${postId}/comments?sort=${sort}`),

  addComment: (postId: string, payload: { content: string; parent_id?: string | null }) =>
    request<{ comment: CommentWithThread }>(`/api/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  updateComment: (commentId: string, content: string) =>
    request<{ comment: any }>(`/api/comments/${commentId}`, {
      method: 'PUT',
      body: JSON.stringify({ content })
    }),

  deleteComment: (commentId: string) =>
    request<{ message: string }>(`/api/comments/${commentId}`, { method: 'DELETE' }),

  toggleCommentLike: (commentId: string) =>
    request<{ liked: boolean; count: number }>(`/api/comments/${commentId}/like`, { method: 'POST' }),

  // Users & Social
  getUserProfile: (username: string) =>
    request<{
      user: UserPublic;
      stats: { followersCount: number; followingCount: number; postsCount: number; totalLikes: number };
      is_following: boolean;
    }>(`/api/users/${username}`),

  updateUserProfile: (id: string, payload: { name?: string; bio?: string; avatar_url?: string; username?: string }) =>
    request<{ user: UserPublic }>(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    }),

  toggleFollow: (userId: string, isCurrentlyFollowing: boolean) =>
    request<{ following: boolean; followersCount: number }>(`/api/users/${userId}/follow`, {
      method: isCurrentlyFollowing ? 'DELETE' : 'POST'
    }),

  // Notifications
  getNotifications: () =>
    request<{ notifications: NotificationItem[]; unreadCount: number }>('/api/notifications'),

  markNotificationRead: (id: string) =>
    request<{ success: boolean }>(`/api/notifications/${id}/read`, { method: 'PUT' }),

  markAllNotificationsRead: () =>
    request<{ success: boolean }>('/api/notifications/read-all', { method: 'PUT' }),

  // Dashboard
  getCreatorAnalytics: () =>
    request<CreatorAnalytics>('/api/dashboard/analytics'),

  // Admin
  getAdminUsers: () =>
    request<{ users: UserPublic[] }>('/api/admin/users'),

  toggleSuspendUser: (userId: string) =>
    request<{ user: UserPublic }>(`/api/admin/users/${userId}/suspend`, { method: 'PUT' }),

  adminDeletePost: (postId: string) =>
    request<{ message: string }>(`/api/admin/posts/${postId}`, { method: 'DELETE' }),

  adminDeleteComment: (commentId: string) =>
    request<{ message: string }>(`/api/admin/comments/${commentId}`, { method: 'DELETE' })
};
