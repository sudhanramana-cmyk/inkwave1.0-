export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  password_hash: string;
  bio: string;
  avatar_url: string;
  role: UserRole;
  is_suspended: boolean;
  reading_streak: number;
  created_at: string;
  updated_at: string;
}

export type UserPublic = Omit<User, 'password_hash'>;

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

export interface PostTag {
  post_id: string;
  tag_id: string;
}

export type PostStatus = 'published' | 'draft' | 'archived';

export interface Post {
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
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  parent_id: string | null;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface CommentLike {
  id: string;
  user_id: string;
  comment_id: string;
  created_at: string;
}

export interface Like {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
}

export type ReactionType = 'love' | 'insightful' | 'interesting' | 'thinking';

export interface Reaction {
  id: string;
  user_id: string;
  post_id: string;
  type: ReactionType;
  created_at: string;
}

export type ShelfFolder = 'recently_saved' | 'reading_later' | 'favorites';

export interface Bookmark {
  id: string;
  user_id: string;
  post_id: string;
  shelf_folder: ShelfFolder;
  created_at: string;
}

export interface Follower {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export type NotificationType = 'like' | 'comment' | 'reply' | 'follow' | 'milestone';

export interface Notification {
  id: string;
  user_id: string;
  actor_id: string | null;
  type: NotificationType;
  title: string;
  message: string;
  link: string;
  is_read: boolean;
  created_at: string;
}

export interface PostWithDetails extends Post {
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

export interface CommentWithThread extends Comment {
  author: UserPublic;
  likes_count: number;
  user_liked?: boolean;
  replies: CommentWithThread[];
}

export interface DatabaseSchema {
  users: User[];
  categories: Category[];
  tags: Tag[];
  post_tags: PostTag[];
  posts: Post[];
  comments: Comment[];
  comment_likes: CommentLike[];
  likes: Like[];
  reactions: Reaction[];
  bookmarks: Bookmark[];
  followers: Follower[];
  notifications: Notification[];
}
