export type UserRole = 'user' | 'admin';

export interface UserPublic {
  id: string;
  name: string;
  username: string;
  email: string;
  bio: string;
  avatar_url: string;
  role: UserRole;
  is_suspended: boolean;
  reading_streak: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export type PostStatus = 'published' | 'draft' | 'archived';
export type ReactionType = 'love' | 'insightful' | 'interesting' | 'thinking';
export type ShelfFolder = 'recently_saved' | 'reading_later' | 'favorites';

export interface PostWithDetails {
  id: string;
  author_id: string;
  title: string;
  subtitle: string;
  content: string;
  cover_image: string;
  category_id: string;
  reading_time_minutes: number;
  status: PostStatus;
  views_count: number;
  created_at: string;
  updated_at: string;
  published_at: string;
  author: UserPublic;
  category: Category | null;
  tags: Tag[];
  likes_count: number;
  comments_count: number;
  reaction_counts: Record<ReactionType, number>;
  user_liked?: boolean;
  user_reaction?: ReactionType | null;
  user_bookmarked?: boolean;
  user_shelf?: ShelfFolder | null;
  trending_score?: number;
}

export interface CommentWithThread {
  id: string;
  post_id: string;
  author_id: string;
  parent_id: string | null;
  content: string;
  created_at: string;
  updated_at: string;
  author: UserPublic;
  likes_count: number;
  user_liked?: boolean;
  replies: CommentWithThread[];
}

export interface NotificationItem {
  id: string;
  user_id: string;
  actor_id: string | null;
  type: 'like' | 'comment' | 'reply' | 'follow' | 'milestone';
  title: string;
  message: string;
  link: string;
  is_read: boolean;
  created_at: string;
}

export interface CreatorAnalytics {
  stats: {
    publishedCount: number;
    draftsCount: number;
    totalViews: number;
    totalLikes: number;
    totalComments: number;
    followers: number;
  };
  timeSeries: Array<{
    label: string;
    views: number;
    likes: number;
    comments: number;
  }>;
  recentStories: Array<{
    id: string;
    title: string;
    views: number;
    likes: number;
    comments: number;
    status: PostStatus;
    published_at: string;
  }>;
}
