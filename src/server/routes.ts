import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from './db';
import { AuthenticatedRequest, generateToken, requireAuth, requireAdmin } from './auth';
import { ReactionType, ShelfFolder } from './types';

export const apiRouter = Router();

// ==========================================
// 1. AUTHENTICATION ROUTES
// ==========================================

apiRouter.post('/auth/register', (req: Request, res: Response) => {
  const { name, username, email, password, avatar_url } = req.body;

  if (!name || !username || !email || !password) {
    return res.status(400).json({ error: 'Name, username, email, and password are required' });
  }

  const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
  if (cleanUsername.length < 3) {
    return res.status(400).json({ error: 'Username must be at least 3 characters (alphanumeric and underscore)' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const existingEmail = db.findUserByEmailOrUsername(email);
  if (existingEmail) {
    return res.status(400).json({ error: 'An account with this email or username already exists' });
  }

  const existingUsername = db.findUserByEmailOrUsername(cleanUsername);
  if (existingUsername) {
    return res.status(400).json({ error: 'Username is already taken' });
  }

  const salt = bcrypt.genSaltSync(10);
  const password_hash = bcrypt.hashSync(password, salt);

  const defaultAvatar = avatar_url || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80`;

  const newUser = db.createUser({
    name: name.trim(),
    username: cleanUsername,
    email: email.trim().toLowerCase(),
    password_hash,
    bio: 'Writer and thinker on INKWAVE.',
    avatar_url: defaultAvatar,
    role: 'user'
  });

  const publicUser = db.toPublicUser(newUser);
  const token = generateToken(publicUser);

  return res.status(201).json({
    message: 'Welcome to INKWAVE',
    token,
    user: publicUser
  });
});

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { identifier, password } = req.body; // identifier can be email or username

  if (!identifier || !password) {
    return res.status(400).json({ error: 'Email/username and password are required' });
  }

  const user = db.findUserByEmailOrUsername(identifier);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials. User not found.' });
  }

  if (user.is_suspended) {
    return res.status(403).json({ error: 'Your account has been suspended by a moderator.' });
  }

  const isValidPassword = bcrypt.compareSync(password, user.password_hash);
  if (!isValidPassword) {
    return res.status(401).json({ error: 'Invalid credentials. Password incorrect.' });
  }

  const publicUser = db.toPublicUser(user);
  const token = generateToken(publicUser);

  return res.json({
    message: 'Login successful',
    token,
    user: publicUser
  });
});

apiRouter.post('/auth/logout', (_req: Request, res: Response) => {
  return res.json({ message: 'Logged out successfully' });
});

apiRouter.get('/auth/me', (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  return res.json({ user: req.user });
});

apiRouter.post('/auth/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  const user = db.findUserByEmailOrUsername(email);
  if (!user) {
    // For security, don't disclose user non-existence or provide friendly confirmation
    return res.json({ message: 'If that email exists in INKWAVE, a password reset link has been dispatched.' });
  }
  return res.json({
    message: 'Password reset link dispatched. (Demo mode: Use reset token "inkwave-reset-demo" or enter a new password directly below)'
  });
});

apiRouter.post('/auth/reset-password', (req: Request, res: Response) => {
  const { email, new_password } = req.body;
  if (!email || !new_password) {
    return res.status(400).json({ error: 'Email and new password are required' });
  }
  if (new_password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  const user = db.findUserByEmailOrUsername(email);
  if (!user) {
    return res.status(404).json({ error: 'Account not found with this email' });
  }

  const salt = bcrypt.genSaltSync(10);
  const password_hash = bcrypt.hashSync(new_password, salt);
  db.updateUser(user.id, { password_hash });

  return res.json({ message: 'Password has been reset successfully. You may now sign in.' });
});

// ==========================================
// 2. CATEGORIES & TAGS
// ==========================================

apiRouter.get('/categories', (_req: Request, res: Response) => {
  return res.json(db.getCategories());
});

apiRouter.get('/tags', (_req: Request, res: Response) => {
  return res.json(db.getTags());
});

// ==========================================
// 3. POSTS / STORIES
// ==========================================

apiRouter.get('/posts', (req: AuthenticatedRequest, res: Response) => {
  const {
    category,
    tag,
    author,
    search,
    sort,
    status = 'published',
    feed,
    limit,
    offset
  } = req.query;

  const feedForUserId = feed === 'wave' && req.user ? req.user.id : undefined;

  const result = db.getPosts({
    status: status as string,
    categorySlug: category as string,
    tagSlug: tag as string,
    authorUsername: author as string,
    searchQuery: search as string,
    sort: sort as any,
    feedForUserId,
    limit: limit ? parseInt(limit as string, 10) : 50,
    offset: offset ? parseInt(offset as string, 10) : 0,
    currentUserId: req.user?.id
  });

  return res.json(result);
});

apiRouter.get('/posts/:id', (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const post = db.getPostById(id, req.user?.id);
  if (!post) {
    return res.status(404).json({ error: 'Story not found' });
  }

  // Increment view counter
  db.incrementPostView(id);

  return res.json({ post });
});

apiRouter.post('/posts', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { title, subtitle, content, cover_image, category_id, tags, status } = req.body;

  if (!title || !content || !category_id) {
    return res.status(400).json({ error: 'Title, content, and category are required' });
  }

  const newPost = db.createPost({
    author_id: req.user!.id,
    title: title.trim(),
    subtitle: (subtitle || '').trim(),
    content,
    cover_image,
    category_id,
    tags: Array.isArray(tags) ? tags : [],
    status: status === 'draft' ? 'draft' : 'published'
  });

  return res.status(201).json({ post: newPost });
});

apiRouter.put('/posts/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const existing = db.getPostById(id);
  if (!existing) {
    return res.status(404).json({ error: 'Story not found' });
  }

  if (existing.author_id !== req.user!.id && req.user!.role !== 'admin') {
    return res.status(403).json({ error: 'You are not authorized to edit this story' });
  }

  const updated = db.updatePost(id, req.body, req.user!.id);
  return res.json({ post: updated });
});

apiRouter.delete('/posts/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const existing = db.getPostById(id);
  if (!existing) {
    return res.status(404).json({ error: 'Story not found' });
  }

  if (existing.author_id !== req.user!.id && req.user!.role !== 'admin') {
    return res.status(403).json({ error: 'You are not authorized to delete this story' });
  }

  db.deletePost(id);
  return res.json({ message: 'Story deleted successfully' });
});

// Related stories
apiRouter.get('/posts/:id/related', (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const currentPost = db.getPostById(id);
  if (!currentPost) {
    return res.status(404).json({ error: 'Story not found' });
  }

  const allPosts = db.getPosts({ status: 'published', currentUserId: req.user?.id }).posts;
  // Score by same category or same tags
  const currentTagSlugs = currentPost.tags.map(t => t.slug);
  const related = allPosts
    .filter(p => p.id !== id)
    .map(p => {
      let score = 0;
      if (p.category_id === currentPost.category_id) score += 3;
      p.tags.forEach(t => {
        if (currentTagSlugs.includes(t.slug)) score += 2;
      });
      return { post: p, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(item => item.post);

  return res.json({ related });
});

// ==========================================
// 4. COMMENTS & THREADED DISCUSSIONS
// ==========================================

apiRouter.get('/posts/:id/comments', (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { sort = 'most_liked' } = req.query;
  const comments = db.getPostComments(id, req.user?.id, sort as any);
  return res.json({ comments, count: comments.length });
});

apiRouter.post('/posts/:id/comments', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { content, parent_id } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Comment content cannot be empty' });
  }

  const comment = db.addComment({
    post_id: id,
    author_id: req.user!.id,
    parent_id: parent_id || null,
    content: content.trim()
  });

  return res.status(201).json({ comment });
});

apiRouter.put('/comments/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { content } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Content cannot be empty' });
  }

  const existing = db.getPostComments(id); // Check or update
  // Find raw
  const comment = db.updateComment(id, content.trim());
  if (!comment) {
    return res.status(404).json({ error: 'Comment not found' });
  }

  return res.json({ comment });
});

apiRouter.delete('/comments/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const success = db.deleteComment(id);
  if (!success) {
    return res.status(404).json({ error: 'Comment not found' });
  }
  return res.json({ message: 'Comment removed' });
});

apiRouter.post('/comments/:id/like', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const result = db.toggleCommentLike(id, req.user!.id);
  return res.json(result);
});

// ==========================================
// 5. LIKES & REACTIONS
// ==========================================

apiRouter.post('/posts/:id/like', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const result = db.togglePostLike(id, req.user!.id);
  return res.json(result);
});

apiRouter.post('/posts/:id/reaction', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { type } = req.body; // 'love' | 'insightful' | 'interesting' | 'thinking'

  if (!['love', 'insightful', 'interesting', 'thinking'].includes(type)) {
    return res.status(400).json({ error: 'Invalid reaction type' });
  }

  const result = db.setPostReaction(id, req.user!.id, type as ReactionType);
  return res.json(result);
});

apiRouter.delete('/posts/:id/reaction', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  // Clear any existing reaction by toggling with current reaction if known or clear
  const post = db.getPostById(id, req.user!.id);
  if (post?.user_reaction) {
    const result = db.setPostReaction(id, req.user!.id, post.user_reaction);
    return res.json(result);
  }
  return res.json({ reaction: null });
});

// ==========================================
// 6. BOOKMARKS & SHELF
// ==========================================

apiRouter.get('/bookmarks', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { folder } = req.query;
  const posts = db.getSavedPosts(req.user!.id, folder as ShelfFolder);
  return res.json({ posts });
});

apiRouter.post('/posts/:id/bookmark', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { folder = 'recently_saved' } = req.body;

  if (!['recently_saved', 'reading_later', 'favorites'].includes(folder)) {
    return res.status(400).json({ error: 'Invalid shelf folder' });
  }

  const result = db.toggleBookmark(id, req.user!.id, folder as ShelfFolder);
  return res.json(result);
});

apiRouter.delete('/posts/:id/bookmark', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const currentPost = db.getPostById(id, req.user!.id);
  if (currentPost?.user_shelf) {
    const result = db.toggleBookmark(id, req.user!.id, currentPost.user_shelf);
    return res.json(result);
  }
  return res.json({ bookmarked: false, folder: null });
});

// ==========================================
// 7. USER PROFILE & SOCIAL
// ==========================================

apiRouter.get('/users/:username', (req: AuthenticatedRequest, res: Response) => {
  const { username } = req.params;
  const user = db.findUserByEmailOrUsername(username);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const stats = db.getUserSocialStats(user.id);
  const is_following = req.user ? db.isFollowing(req.user.id, user.id) : false;

  const publicUser = db.toPublicUser(user);

  return res.json({
    user: publicUser,
    stats,
    is_following
  });
});

apiRouter.put('/users/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  if (req.user!.id !== id && req.user!.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized to edit this profile' });
  }

  const { name, bio, avatar_url, username } = req.body;
  const updates: any = {};
  if (name) updates.name = name.trim();
  if (bio !== undefined) updates.bio = bio.trim();
  if (avatar_url) updates.avatar_url = avatar_url;
  if (username) {
    const clean = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    const exists = db.findUserByEmailOrUsername(clean);
    if (exists && exists.id !== id) {
      return res.status(400).json({ error: 'Username already in use' });
    }
    updates.username = clean;
  }

  const updated = db.updateUser(id, updates);
  if (!updated) {
    return res.status(404).json({ error: 'User not found' });
  }

  return res.json({ user: db.toPublicUser(updated) });
});

apiRouter.post('/users/:id/follow', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    const result = db.toggleFollow(req.user!.id, id);
    return res.json(result);
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Could not update follow status' });
  }
});

apiRouter.delete('/users/:id/follow', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    const isCurrently = db.isFollowing(req.user!.id, id);
    if (isCurrently) {
      const result = db.toggleFollow(req.user!.id, id);
      return res.json(result);
    }
    const followersCount = db.getUserSocialStats(id).followersCount;
    return res.json({ following: false, followersCount });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// ==========================================
// 8. NOTIFICATIONS
// ==========================================

apiRouter.get('/notifications', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const notifications = db.getNotifications(req.user!.id);
  const unreadCount = notifications.filter(n => !n.is_read).length;
  return res.json({ notifications, unreadCount });
});

apiRouter.put('/notifications/:id/read', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const success = db.markNotificationAsRead(id, req.user!.id);
  return res.json({ success });
});

apiRouter.put('/notifications/read-all', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  db.markAllNotificationsAsRead(req.user!.id);
  return res.json({ success: true });
});

// ==========================================
// 9. CREATOR DASHBOARD
// ==========================================

apiRouter.get('/dashboard/analytics', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const analytics = db.getCreatorAnalytics(req.user!.id);
  return res.json(analytics);
});

// ==========================================
// 10. ADMIN MODERATION
// ==========================================

apiRouter.get('/admin/users', requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  const users = db.getAllUsers();
  return res.json({ users });
});

apiRouter.put('/admin/users/:id/suspend', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const user = db.findUserById(id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  if (user.role === 'admin') {
    return res.status(400).json({ error: 'Cannot suspend an administrator' });
  }
  const updated = db.updateUser(id, { is_suspended: !user.is_suspended });
  return res.json({ user: db.toPublicUser(updated!) });
});

apiRouter.delete('/admin/posts/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const success = db.deletePost(id);
  if (!success) {
    return res.status(404).json({ error: 'Post not found' });
  }
  return res.json({ message: 'Story removed by administrator' });
});

apiRouter.delete('/admin/comments/:id', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const success = db.deleteComment(id);
  if (!success) {
    return res.status(404).json({ error: 'Comment not found' });
  }
  return res.json({ message: 'Comment removed by administrator' });
});
