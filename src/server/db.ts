import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  DatabaseSchema,
  User,
  UserPublic,
  Category,
  Tag,
  Post,
  Comment,
  Like,
  Reaction,
  Bookmark,
  Follower,
  Notification,
  PostWithDetails,
  CommentWithThread,
  ReactionType,
  ShelfFolder
} from './types';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'inkwave.db.json');

const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Technology', slug: 'technology', description: 'Computing, architectures, and the digital ethos.' },
  { id: 'cat-2', name: 'Design', slug: 'design', description: 'Typography, spatial ergonomics, and intentional aesthetics.' },
  { id: 'cat-3', name: 'Life', slug: 'life', description: 'Reflections on modern existence, rituals, and focus.' },
  { id: 'cat-4', name: 'Culture', slug: 'culture', description: 'Media, philosophy, linguistics, and collective habits.' },
  { id: 'cat-5', name: 'Science', slug: 'science', description: 'Neuroscience, cognitive science, and natural phenomena.' },
  { id: 'cat-6', name: 'Business', slug: 'business', description: 'Strategy, sustainable craft, and creative enterprises.' },
  { id: 'cat-7', name: 'Programming', slug: 'programming', description: 'Languages, craftsmanship, and elegant engineering.' },
  { id: 'cat-8', name: 'College', slug: 'college', description: 'Academia, discovery, and formative transformations.' },
  { id: 'cat-9', name: 'Personal', slug: 'personal', description: 'Memoirs, inner dialogues, and honest observations.' },
  { id: 'cat-10', name: 'Random', slug: 'random', description: 'Curiosities, ephemera, and stray sparks.' }
];

const INITIAL_TAGS: Tag[] = [
  { id: 'tag-1', name: 'Deep Work', slug: 'deep-work' },
  { id: 'tag-2', name: 'Minimalism', slug: 'minimalism' },
  { id: 'tag-3', name: 'Architecture', slug: 'architecture' },
  { id: 'tag-4', name: 'Typography', slug: 'typography' },
  { id: 'tag-5', name: 'Humanity', slug: 'humanity' },
  { id: 'tag-6', name: 'Craftsmanship', slug: 'craftsmanship' },
  { id: 'tag-7', name: 'Silence', slug: 'silence' },
  { id: 'tag-8', name: 'Future', slug: 'future' }
];

function getInitialDatabase(): DatabaseSchema {
  const salt = bcrypt.genSaltSync(10);
  const defaultPasswordHash = bcrypt.hashSync('password123', salt);
  const adminPasswordHash = bcrypt.hashSync('admin123', salt);

  const users: User[] = [
    {
      id: 'usr-admin',
      name: 'Arjun Mehta',
      username: 'admin',
      email: 'admin@inkwave.io',
      password_hash: adminPasswordHash,
      bio: 'Editor-in-chief & lead curator at INKWAVE. Investigating how prose and digital spaces reshape human attention.',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      role: 'admin',
      is_suspended: false,
      reading_streak: 14,
      created_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'usr-1',
      name: 'Elena Rostova',
      username: 'elena',
      email: 'elena@inkwave.io',
      password_hash: defaultPasswordHash,
      bio: 'Architectural writer, typographic researcher, and essayist based in Berlin. Author of "The Weight of White Space".',
      avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
      role: 'user',
      is_suspended: false,
      reading_streak: 8,
      created_at: new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'usr-2',
      name: 'Marcus Vance',
      username: 'marcus',
      email: 'marcus@inkwave.io',
      password_hash: defaultPasswordHash,
      bio: 'Staff systems engineer & historian of computation. Writing at the crossroads of code, memory, and cognitive durability.',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      role: 'user',
      is_suspended: false,
      reading_streak: 21,
      created_at: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'usr-3',
      name: 'Sofia Chen',
      username: 'sofia',
      email: 'sofia@inkwave.io',
      password_hash: defaultPasswordHash,
      bio: 'Cultural anthropologist exploring quiet technology, digital monasticism, and non-extractive social instruments.',
      avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
      role: 'user',
      is_suspended: false,
      reading_streak: 5,
      created_at: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString()
    }
  ];

  const posts: Post[] = [
    {
      id: 'post-1',
      author_id: 'usr-1',
      title: 'The Internet Is Getting Louder. Maybe We Need Better Silence.',
      subtitle: 'Why the future of software and literature belongs to calm canvases, deliberate pauses, and anti-extractive rhythm.',
      content: `The modern web operates under an unspoken decree: every square millimeter of visual field must clamor for your nervous system. Infinite feeds accelerate by design; push notifications arrive calibrated to induce mild cortisol spikes; algorithms measure your human vitality in milliseconds of dwell time.

Yet when we look across centuries of enduring civilization, the most enduring thoughts were never born inside high-velocity trading floors or carnival midways. They were forged in courtyards, library reading rooms, stone monastic cloisters, and handwritten correspondence carried slowly by boat.

### 01. The Architecture of Stillness

Architecture has long understood what software engineering frequently forgets: void is not emptiness; void is room to breathe. When a builder creates an open atrium in a concrete building, they are not wasting expensive urban square footage. They are providing the spatial decompression chamber necessary for inhabitants to process the weight of the structure.

In digital publishing, white space functions with identical necessity. When a sentence is flanked by measured margin, the reader's eye decelerates. The rhythm of comprehension changes from panicked skimming to genuine absorption.

> "A room without silence is simply an acoustic container. A page without quiet is merely noise organized into rows."

### 02. The Toll of Reactionary Velocity

Consider how traditional discourse operates versus contemporary social streams. In high-frequency forums, an idea must evoke an immediate biological reaction—fury, outrage, or instant laughter—within 1.2 seconds, otherwise it is discarded by the ranking engine. The consequence is devastating: nuanced propositions are flattened into polemical slogans.

INKWAVE was conceived around the contrary premise: what if a publishing platform treated the reader's attention as a sacred reservoir rather than an extractable commodity?

### 03. Crafting for Longevity

When you write something intended to stay, you choose words with tactile gravity. You revise the transitions. You remove the cheap rhetorical tricks designed for cheap clicks. You give ideas the room they need to settle.

The next renaissance of the internet will not belong to faster feeds. It will belong to thoughtful refuges where people come to write what lasts.`,
      cover_image: '/src/assets/images/inkwave_editorial_silence_1790787910935.jpg',
      category_id: 'cat-4',
      reading_time_minutes: 5,
      status: 'published',
      views_count: 1240,
      created_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
      published_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'post-2',
      author_id: 'usr-2',
      title: 'Monolithic Simplicity: Rediscovering Elegance in Software Craft',
      subtitle: 'Why hyper-fragmented microservices often solve organizational friction while creating cognitive ruin for engineers.',
      content: `Over the past decade, our industry adopted an architectural doctrine prioritizing extreme operational fragmentation. We split single cohesive programs into dozens of distributed microservices, wrapped them in elaborate service meshes, and spent millions of engineering hours debugging network partitions that should have been straightforward in-process function calls.

There is deep wisdom in the single, well-architected monolith. A single binary with clean modular boundaries respects the developer's working memory.

### 01. The Cognitive Load of Distributed Systems

When every data transaction spans three network hops and four remote queues, understanding what your system is doing ceases to be an intellectual exercise and becomes forensic archaeology. You cannot step through the execution path in a debugger; you must reconstruct reality from scattered traces.

### 02. The Resurgence of Craft

Elegance is not the absence of complexity; it is the deliberate mastery of it. When a craftsperson builds a chair, they do not assemble forty detachable plastic joints where a single hand-cut mortise and tenon will hold for eighty years.

\`\`\`typescript
// The elegance of single-turn clarity
interface Craftsmanship {
  clarity: boolean;
  durability: 'generational';
  dependencies: 'minimal';
}
\`\`\`

We are beginning to see an overdue cultural correction. Forward-thinking teams are pruning superfluous dependencies, consolidating sprawling micro-clusters into unified codebases, and rediscovering the sheer joy of instantaneous local builds.`,
      cover_image: '/src/assets/images/inkwave_editorial_technology_1790787894743.jpg',
      category_id: 'cat-1',
      reading_time_minutes: 6,
      status: 'published',
      views_count: 890,
      created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
      published_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'post-3',
      author_id: 'usr-1',
      title: 'Concrete and Horizon: Brutalist Lessons for Modern User Interfaces',
      subtitle: 'How twentieth-century monumentalism teaches contemporary designers about honesty of materials, spatial mass, and unyielding dignity.',
      content: `Brutalist architecture has frequently suffered from cheap caricatures: cold, forbidding, gray monoliths hostile to the human spirit. But those who have stood beneath the soaring vaults of Le Corbusier or walked the sun-washed walkways of the Barbican understand its true virtue: absolute honesty of materials.

Concrete does not pretend to be marble. Wood formwork grain remains stamped directly onto the cured face. There are no ornamental cornices masking structural faults.

### The Problem With Flat Glassmorphism

In UI design, we have endured cycles of excessive ornamentation: first skeuomorphism, then extreme flat sterility, followed by ubiquitous translucent pills and neon glows. Every SaaS landing page has begun to look like an interchangeable template generated by an uninspired algorithm.

### Towards Textural Honesty

What if software UI embraced structural presence? 

1. **Typographic Hierarchy as Spatial Foundation**: Let font scale and weight bear the structural load, rather than relying on heavy box shadows and nested colored cards.
2. **Hairline Boundaries**: Use delicate hairlines and generous paper space to establish spatial rhythm.
3. **Respect for the Reader's Eye**: Allow focal points to rest without fighting four blinking status badges.`,
      cover_image: '/src/assets/images/inkwave_editorial_architecture_1790787881090.jpg',
      category_id: 'cat-2',
      reading_time_minutes: 4,
      status: 'published',
      views_count: 670,
      created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
      published_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'post-4',
      author_id: 'usr-3',
      title: 'The Lost Art of Marginalia: Why Private Reading Demands a Pen in Hand',
      subtitle: 'From medieval parchment to digital tablets, the notes we scribble in margins reveal how thinking actually happens.',
      content: `When Voltaire read books in his library at Ferney, he rarely left a page unscathed. His personal copies are dense thickets of exclamation points, counter-arguments, scrawled revisions, and marginal sketches. The physical book was not a museum relic to be preserved in sterile isolation; it was a living sparring partner.

Today, digital reading has largely reduced us to passive consumers of backlit pixels. We scroll through thousand-word essays on phones while riding escalators, our minds grazing across surfaces without ever anchoring anchor lines into deep memory.

### Reclaiming Active Dialogue

To read without reacting is merely to let someone else's thoughts wash across your cortex. True comprehension begins the exact second you question a thesis, highlight an unexpected phrase, or write in the margin: *Is this truly so?*

In crafting INKWAVE's discussion environment, we wanted commentary to feel less like a comments section at the bottom of a tabloid and more like marginalia shared across an intellectual guild.`,
      cover_image: '/src/assets/images/inkwave_editorial_culture_1790787924551.jpg',
      category_id: 'cat-4',
      reading_time_minutes: 4,
      status: 'published',
      views_count: 530,
      created_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
      published_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString()
    }
  ];

  const post_tags = [
    { post_id: 'post-1', tag_id: 'tag-1' },
    { post_id: 'post-1', tag_id: 'tag-7' },
    { post_id: 'post-1', tag_id: 'tag-5' },
    { post_id: 'post-2', tag_id: 'tag-6' },
    { post_id: 'post-2', tag_id: 'tag-8' },
    { post_id: 'post-3', tag_id: 'tag-3' },
    { post_id: 'post-3', tag_id: 'tag-4' },
    { post_id: 'post-4', tag_id: 'tag-5' },
    { post_id: 'post-4', tag_id: 'tag-2' }
  ];

  const comments: Comment[] = [
    {
      id: 'com-1',
      post_id: 'post-1',
      author_id: 'usr-2',
      parent_id: null,
      content: 'This completely changed how I think about pacing in digital software. The analogy between architectural void and typographic white space is particularly sharp.',
      created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'com-2',
      post_id: 'post-1',
      author_id: 'usr-3',
      parent_id: 'com-1',
      content: 'Same. Especially the point about reactionary velocity. When ranking algorithms reward emotional volatility, silence becomes a subversive act.',
      created_at: new Date(Date.now() - 1.5 * 24 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 1.5 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'com-3',
      post_id: 'post-1',
      author_id: 'usr-admin',
      parent_id: 'com-2',
      content: 'Interesting — I had the opposite experience early in my career where I believed high speed was synonymous with high productivity. Took ten years of burn-out to see this truth.',
      created_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'com-4',
      post_id: 'post-2',
      author_id: 'usr-1',
      parent_id: null,
      content: 'Could not agree more on the cognitive ruin caused by needless microservice partitioning. When teams spend 70% of sprint time coordinating API contracts across 14 repos, craft is the first casualty.',
      created_at: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString()
    }
  ];

  const likes: Like[] = [
    { id: 'lik-1', user_id: 'usr-2', post_id: 'post-1', created_at: new Date().toISOString() },
    { id: 'lik-2', user_id: 'usr-3', post_id: 'post-1', created_at: new Date().toISOString() },
    { id: 'lik-3', user_id: 'usr-admin', post_id: 'post-1', created_at: new Date().toISOString() },
    { id: 'lik-4', user_id: 'usr-1', post_id: 'post-2', created_at: new Date().toISOString() },
    { id: 'lik-5', user_id: 'usr-3', post_id: 'post-2', created_at: new Date().toISOString() },
    { id: 'lik-6', user_id: 'usr-2', post_id: 'post-3', created_at: new Date().toISOString() }
  ];

  const reactions: Reaction[] = [
    { id: 'rea-1', user_id: 'usr-2', post_id: 'post-1', type: 'love', created_at: new Date().toISOString() },
    { id: 'rea-2', user_id: 'usr-3', post_id: 'post-1', type: 'insightful', created_at: new Date().toISOString() },
    { id: 'rea-3', user_id: 'usr-admin', post_id: 'post-1', type: 'thinking', created_at: new Date().toISOString() },
    { id: 'rea-4', user_id: 'usr-1', post_id: 'post-2', type: 'insightful', created_at: new Date().toISOString() },
    { id: 'rea-5', user_id: 'usr-3', post_id: 'post-2', type: 'interesting', created_at: new Date().toISOString() },
    { id: 'rea-6', user_id: 'usr-2', post_id: 'post-3', type: 'love', created_at: new Date().toISOString() }
  ];

  const bookmarks: Bookmark[] = [
    { id: 'bmk-1', user_id: 'usr-admin', post_id: 'post-1', shelf_folder: 'favorites', created_at: new Date().toISOString() },
    { id: 'bmk-2', user_id: 'usr-2', post_id: 'post-1', shelf_folder: 'reading_later', created_at: new Date().toISOString() },
    { id: 'bmk-3', user_id: 'usr-1', post_id: 'post-2', shelf_folder: 'recently_saved', created_at: new Date().toISOString() }
  ];

  const followers: Follower[] = [
    { id: 'fol-1', follower_id: 'usr-admin', following_id: 'usr-1', created_at: new Date().toISOString() },
    { id: 'fol-2', follower_id: 'usr-2', following_id: 'usr-1', created_at: new Date().toISOString() },
    { id: 'fol-3', follower_id: 'usr-3', following_id: 'usr-1', created_at: new Date().toISOString() },
    { id: 'fol-4', follower_id: 'usr-1', following_id: 'usr-2', created_at: new Date().toISOString() },
    { id: 'fol-5', follower_id: 'usr-admin', following_id: 'usr-2', created_at: new Date().toISOString() }
  ];

  const notifications: Notification[] = [
    {
      id: 'notif-1',
      user_id: 'usr-1',
      actor_id: 'usr-2',
      type: 'comment',
      title: 'New discussion',
      message: 'Marcus Vance commented on "The Internet Is Getting Louder. Maybe We Need Better Silence."',
      link: '/story/post-1',
      is_read: false,
      created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'notif-2',
      user_id: 'usr-1',
      actor_id: 'usr-admin',
      type: 'follow',
      title: 'New follower',
      message: 'Arjun Mehta started following your wave.',
      link: '/profile/admin',
      is_read: true,
      created_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
    },
    {
      id: 'notif-3',
      user_id: 'usr-1',
      actor_id: null,
      type: 'milestone',
      title: 'Story Milestone',
      message: 'Your story reached 1,000 views!',
      link: '/story/post-1',
      is_read: false,
      created_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString()
    }
  ];

  return {
    users,
    categories: INITIAL_CATEGORIES,
    tags: INITIAL_TAGS,
    post_tags,
    posts,
    comments,
    comment_likes: [],
    likes,
    reactions,
    bookmarks,
    followers,
    notifications
  };
}

class RelationalDatabase {
  private data: DatabaseSchema;
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.ensureDataDir();
    this.data = this.loadData();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.users && parsed.posts) {
          return parsed;
        }
      }
    } catch (err) {
      console.error('Failed to load DB file, reinitializing default data:', err);
    }
    const initial = getInitialDatabase();
    this.persistSync(initial);
    return initial;
  }

  private persistSync(data: DatabaseSchema) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  private scheduleSave() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.persistSync(this.data);
    }, 100);
  }

  // --- Users Operations ---
  public toPublicUser(user: User): UserPublic {
    const { password_hash, ...rest } = user;
    return rest;
  }

  public findUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public findUserByEmailOrUsername(identifier: string): User | undefined {
    const lower = identifier.toLowerCase();
    return this.data.users.find(u => u.email.toLowerCase() === lower || u.username.toLowerCase() === lower);
  }

  public createUser(userData: Omit<User, 'id' | 'created_at' | 'updated_at' | 'reading_streak' | 'is_suspended'>): User {
    const id = `usr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();
    const newUser: User = {
      ...userData,
      id,
      reading_streak: 1,
      is_suspended: false,
      created_at: now,
      updated_at: now
    };
    this.data.users.push(newUser);
    this.scheduleSave();
    return newUser;
  }

  public updateUser(id: string, updates: Partial<Pick<User, 'name' | 'bio' | 'avatar_url' | 'username' | 'password_hash' | 'is_suspended' | 'reading_streak'>>): User | null {
    const user = this.findUserById(id);
    if (!user) return null;
    Object.assign(user, updates, { updated_at: new Date().toISOString() });
    this.scheduleSave();
    return user;
  }

  public getAllUsers(): UserPublic[] {
    return this.data.users.map(this.toPublicUser);
  }

  // --- Categories & Tags ---
  public getCategories(): Category[] {
    return this.data.categories;
  }

  public getCategoryById(id: string): Category | undefined {
    return this.data.categories.find(c => c.id === id);
  }

  public getCategoryBySlug(slug: string): Category | undefined {
    return this.data.categories.find(c => c.slug.toLowerCase() === slug.toLowerCase());
  }

  public getTags(): Tag[] {
    return this.data.tags;
  }

  public findOrCreateTag(name: string): Tag {
    const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const existing = this.data.tags.find(t => t.slug === slug || t.name.toLowerCase() === name.toLowerCase());
    if (existing) return existing;
    const newTag: Tag = {
      id: `tag-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: name.trim(),
      slug
    };
    this.data.tags.push(newTag);
    this.scheduleSave();
    return newTag;
  }

  // --- Posts Operations ---
  public getPostTags(postId: string): Tag[] {
    const tagIds = this.data.post_tags.filter(pt => pt.post_id === postId).map(pt => pt.tag_id);
    return this.data.tags.filter(t => tagIds.includes(t.id));
  }

  public setPostTags(postId: string, tagNames: string[]) {
    // Remove existing
    this.data.post_tags = this.data.post_tags.filter(pt => pt.post_id !== postId);
    for (const name of tagNames) {
      if (name.trim()) {
        const tag = this.findOrCreateTag(name);
        this.data.post_tags.push({ post_id: postId, tag_id: tag.id });
      }
    }
    this.scheduleSave();
  }

  public calculateTrendingScore(post: Post): number {
    const likes = this.data.likes.filter(l => l.post_id === post.id).length;
    const comments = this.data.comments.filter(c => c.post_id === post.id).length;
    const reactions = this.data.reactions.filter(r => r.post_id === post.id).length;
    const views = post.views_count || 0;

    const pubTime = new Date(post.published_at || post.created_at).getTime();
    const hoursSince = Math.max(0.1, (Date.now() - pubTime) / (1000 * 3600));

    // Trending formula with temporal decay
    const engagement = views * 1 + likes * 4 + comments * 6 + reactions * 4;
    return Number((engagement / Math.pow(hoursSince + 2, 1.3)).toFixed(2));
  }

  public enrichPost(post: Post, currentUserId?: string): PostWithDetails {
    const author = this.findUserById(post.author_id);
    const authorPublic: UserPublic = author ? this.toPublicUser(author) : {
      id: post.author_id,
      name: 'Anonymous',
      username: 'anonymous',
      email: '',
      bio: '',
      avatar_url: '',
      role: 'user',
      is_suspended: false,
      reading_streak: 0,
      created_at: post.created_at,
      updated_at: post.updated_at
    };

    const category = this.getCategoryById(post.category_id) || null;
    const tags = this.getPostTags(post.id);
    const likes_count = this.data.likes.filter(l => l.post_id === post.id).length;
    const comments_count = this.data.comments.filter(c => c.post_id === post.id).length;

    const postReactions = this.data.reactions.filter(r => r.post_id === post.id);
    const reaction_counts: Record<ReactionType, number> = {
      love: postReactions.filter(r => r.type === 'love').length,
      insightful: postReactions.filter(r => r.type === 'insightful').length,
      interesting: postReactions.filter(r => r.type === 'interesting').length,
      thinking: postReactions.filter(r => r.type === 'thinking').length
    };

    let user_liked = false;
    let user_reaction: ReactionType | null = null;
    let user_bookmarked = false;
    let user_shelf: ShelfFolder | null = null;

    if (currentUserId) {
      user_liked = this.data.likes.some(l => l.post_id === post.id && l.user_id === currentUserId);
      const userRec = postReactions.find(r => r.user_id === currentUserId);
      if (userRec) user_reaction = userRec.type;
      const bmk = this.data.bookmarks.find(b => b.post_id === post.id && b.user_id === currentUserId);
      if (bmk) {
        user_bookmarked = true;
        user_shelf = bmk.shelf_folder;
      }
    }

    const trending_score = this.calculateTrendingScore(post);

    return {
      ...post,
      author: authorPublic,
      category,
      tags,
      likes_count,
      comments_count,
      reaction_counts,
      user_liked,
      user_reaction,
      user_bookmarked,
      user_shelf,
      trending_score
    };
  }

  public getPosts(options: {
    status?: string;
    categorySlug?: string;
    tagSlug?: string;
    authorUsername?: string;
    searchQuery?: string;
    sort?: 'trending' | 'newest' | 'popular' | 'deep_reads' | 'quick_reads';
    feedForUserId?: string;
    limit?: number;
    offset?: number;
    currentUserId?: string;
  } = {}): { posts: PostWithDetails[]; total: number } {
    let list = this.data.posts.filter(p => !options.status || p.status === options.status);

    if (options.categorySlug) {
      const cat = this.getCategoryBySlug(options.categorySlug);
      if (cat) {
        list = list.filter(p => p.category_id === cat.id);
      }
    }

    if (options.tagSlug) {
      const tag = this.data.tags.find(t => t.slug === options.tagSlug);
      if (tag) {
        const postIds = this.data.post_tags.filter(pt => pt.tag_id === tag.id).map(pt => pt.post_id);
        list = list.filter(p => postIds.includes(p.id));
      }
    }

    if (options.authorUsername) {
      const author = this.findUserByEmailOrUsername(options.authorUsername);
      if (author) {
        list = list.filter(p => p.author_id === author.id);
      }
    }

    if (options.feedForUserId) {
      const followingIds = this.data.followers
        .filter(f => f.follower_id === options.feedForUserId)
        .map(f => f.following_id);
      list = list.filter(p => followingIds.includes(p.author_id) || p.author_id === options.feedForUserId);
    }

    if (options.searchQuery) {
      const q = options.searchQuery.toLowerCase().trim();
      list = list.filter(p => {
        const titleMatch = p.title.toLowerCase().includes(q);
        const subMatch = p.subtitle.toLowerCase().includes(q);
        const contentMatch = p.content.toLowerCase().includes(q);
        const author = this.findUserById(p.author_id);
        const authorMatch = author && (author.name.toLowerCase().includes(q) || author.username.toLowerCase().includes(q));
        const tags = this.getPostTags(p.id);
        const tagMatch = tags.some(t => t.name.toLowerCase().includes(q));
        const cat = this.getCategoryById(p.category_id);
        const catMatch = cat && cat.name.toLowerCase().includes(q);
        return titleMatch || subMatch || contentMatch || authorMatch || tagMatch || catMatch;
      });
    }

    // Sorting
    if (options.sort === 'trending') {
      list.sort((a, b) => this.calculateTrendingScore(b) - this.calculateTrendingScore(a));
    } else if (options.sort === 'popular') {
      list.sort((a, b) => (b.views_count || 0) - (a.views_count || 0));
    } else if (options.sort === 'deep_reads') {
      list.sort((a, b) => b.reading_time_minutes - a.reading_time_minutes);
    } else if (options.sort === 'quick_reads') {
      list = list.filter(p => p.reading_time_minutes <= 4);
      list.sort((a, b) => a.reading_time_minutes - b.reading_time_minutes);
    } else {
      // Newest
      list.sort((a, b) => new Date(b.published_at || b.created_at).getTime() - new Date(a.published_at || a.created_at).getTime());
    }

    const total = list.length;
    const offset = options.offset || 0;
    const limit = options.limit || 50;
    const paged = list.slice(offset, offset + limit);

    return {
      posts: paged.map(p => this.enrichPost(p, options.currentUserId)),
      total
    };
  }

  public getPostById(id: string, currentUserId?: string): PostWithDetails | null {
    const post = this.data.posts.find(p => p.id === id);
    if (!post) return null;
    return this.enrichPost(post, currentUserId);
  }

  public incrementPostView(id: string): void {
    const post = this.data.posts.find(p => p.id === id);
    if (post) {
      post.views_count = (post.views_count || 0) + 1;
      
      // Check milestones (e.g. 50, 100, 500, 1000 views)
      const milestones = [50, 100, 500, 1000, 2500, 5000];
      if (milestones.includes(post.views_count)) {
        this.createNotification({
          user_id: post.author_id,
          actor_id: null,
          type: 'milestone',
          title: 'Story Milestone reached',
          message: `Your story "${post.title.slice(0, 40)}..." reached ${post.views_count.toLocaleString()} views!`,
          link: `/story/${post.id}`
        });
      }
      this.scheduleSave();
    }
  }

  public createPost(data: {
    author_id: string;
    title: string;
    subtitle: string;
    content: string;
    cover_image?: string;
    category_id: string;
    tags: string[];
    status?: 'published' | 'draft';
  }): PostWithDetails {
    const wordsCount = data.content.trim().split(/\s+/).filter(Boolean).length;
    const readingTime = Math.max(1, Math.ceil(wordsCount / 200));

    const id = `post-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const now = new Date().toISOString();
    const newPost: Post = {
      id,
      author_id: data.author_id,
      title: data.title,
      subtitle: data.subtitle || '',
      content: data.content,
      cover_image: data.cover_image || '/src/assets/images/inkwave_editorial_architecture_1790787881090.jpg',
      category_id: data.category_id,
      reading_time_minutes: readingTime,
      status: data.status || 'published',
      views_count: 0,
      created_at: now,
      updated_at: now,
      published_at: data.status === 'draft' ? '' : now
    };

    this.data.posts.push(newPost);
    this.setPostTags(id, data.tags || []);
    this.scheduleSave();
    return this.enrichPost(newPost, data.author_id);
  }

  public updatePost(id: string, updates: Partial<{
    title: string;
    subtitle: string;
    content: string;
    cover_image: string;
    category_id: string;
    status: 'published' | 'draft' | 'archived';
    tags: string[];
  }>, currentUserId: string): PostWithDetails | null {
    const post = this.data.posts.find(p => p.id === id);
    if (!post) return null;

    if (updates.title !== undefined) post.title = updates.title;
    if (updates.subtitle !== undefined) post.subtitle = updates.subtitle;
    if (updates.content !== undefined) {
      post.content = updates.content;
      const wordsCount = updates.content.trim().split(/\s+/).filter(Boolean).length;
      post.reading_time_minutes = Math.max(1, Math.ceil(wordsCount / 200));
    }
    if (updates.cover_image !== undefined) post.cover_image = updates.cover_image;
    if (updates.category_id !== undefined) post.category_id = updates.category_id;
    if (updates.status !== undefined) {
      post.status = updates.status;
      if (updates.status === 'published' && !post.published_at) {
        post.published_at = new Date().toISOString();
      }
    }
    post.updated_at = new Date().toISOString();

    if (updates.tags) {
      this.setPostTags(id, updates.tags);
    }

    this.scheduleSave();
    return this.enrichPost(post, currentUserId);
  }

  public deletePost(id: string): boolean {
    const index = this.data.posts.findIndex(p => p.id === id);
    if (index === -1) return false;
    this.data.posts.splice(index, 1);
    // Cascade delete relations
    this.data.comments = this.data.comments.filter(c => c.post_id !== id);
    this.data.likes = this.data.likes.filter(l => l.post_id !== id);
    this.data.reactions = this.data.reactions.filter(r => r.post_id !== id);
    this.data.bookmarks = this.data.bookmarks.filter(b => b.post_id !== id);
    this.data.post_tags = this.data.post_tags.filter(pt => pt.post_id !== id);
    this.scheduleSave();
    return true;
  }

  // --- Comments & Threaded Discussions ---
  public getPostComments(postId: string, currentUserId?: string, sort: 'newest' | 'oldest' | 'most_liked' = 'most_liked'): CommentWithThread[] {
    const allPostComments = this.data.comments.filter(c => c.post_id === postId);

    const enrich = (comment: Comment): CommentWithThread => {
      const author = this.findUserById(comment.author_id);
      const authorPublic = author ? this.toPublicUser(author) : {
        id: comment.author_id,
        name: 'Reader',
        username: 'reader',
        email: '',
        bio: '',
        avatar_url: '',
        role: 'user' as const,
        is_suspended: false,
        reading_streak: 0,
        created_at: comment.created_at,
        updated_at: comment.updated_at
      };
      const likes_count = this.data.comment_likes.filter(cl => cl.comment_id === comment.id).length;
      const user_liked = currentUserId ? this.data.comment_likes.some(cl => cl.comment_id === comment.id && cl.user_id === currentUserId) : false;

      const directReplies = allPostComments.filter(c => c.parent_id === comment.id);
      const replies = directReplies.map(enrich);

      // Sort replies chronologically
      replies.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

      return {
        ...comment,
        author: authorPublic,
        likes_count,
        user_liked,
        replies
      };
    };

    const rootComments = allPostComments.filter(c => !c.parent_id);
    const threaded = rootComments.map(enrich);

    if (sort === 'newest') {
      threaded.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sort === 'oldest') {
      threaded.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else {
      // most_liked
      threaded.sort((a, b) => b.likes_count - a.likes_count);
    }

    return threaded;
  }

  public addComment(data: {
    post_id: string;
    author_id: string;
    parent_id?: string | null;
    content: string;
  }): CommentWithThread {
    const id = `com-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const now = new Date().toISOString();
    const comment: Comment = {
      id,
      post_id: data.post_id,
      author_id: data.author_id,
      parent_id: data.parent_id || null,
      content: data.content,
      created_at: now,
      updated_at: now
    };
    this.data.comments.push(comment);

    // Notify post author or parent comment author
    const post = this.data.posts.find(p => p.id === data.post_id);
    const commenter = this.findUserById(data.author_id);
    const commenterName = commenter?.name || 'Someone';

    if (data.parent_id) {
      const parentComment = this.data.comments.find(c => c.id === data.parent_id);
      if (parentComment && parentComment.author_id !== data.author_id) {
        this.createNotification({
          user_id: parentComment.author_id,
          actor_id: data.author_id,
          type: 'reply',
          title: 'Reply to your note',
          message: `${commenterName} replied: "${data.content.slice(0, 50)}..."`,
          link: `/story/${data.post_id}`
        });
      }
    } else if (post && post.author_id !== data.author_id) {
      this.createNotification({
        user_id: post.author_id,
        actor_id: data.author_id,
        type: 'comment',
        title: 'New reflection',
        message: `${commenterName} left a comment on "${post.title.slice(0, 35)}..."`,
        link: `/story/${data.post_id}`
      });
    }

    this.scheduleSave();
    const author = commenter ? this.toPublicUser(commenter) : this.toPublicUser(this.data.users[0]);
    return {
      ...comment,
      author,
      likes_count: 0,
      user_liked: false,
      replies: []
    };
  }

  public updateComment(id: string, content: string): Comment | null {
    const comment = this.data.comments.find(c => c.id === id);
    if (!comment) return null;
    comment.content = content;
    comment.updated_at = new Date().toISOString();
    this.scheduleSave();
    return comment;
  }

  public deleteComment(id: string): boolean {
    const index = this.data.comments.findIndex(c => c.id === id);
    if (index === -1) return false;
    this.data.comments.splice(index, 1);
    this.data.comment_likes = this.data.comment_likes.filter(cl => cl.comment_id !== id);
    this.scheduleSave();
    return true;
  }

  public toggleCommentLike(commentId: string, userId: string): { liked: boolean; count: number } {
    const existingIndex = this.data.comment_likes.findIndex(cl => cl.comment_id === commentId && cl.user_id === userId);
    let liked = false;
    if (existingIndex >= 0) {
      this.data.comment_likes.splice(existingIndex, 1);
      liked = false;
    } else {
      this.data.comment_likes.push({
        id: `clik-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        comment_id: commentId,
        user_id: userId,
        created_at: new Date().toISOString()
      });
      liked = true;
    }
    const count = this.data.comment_likes.filter(cl => cl.comment_id === commentId).length;
    this.scheduleSave();
    return { liked, count };
  }

  // --- Likes & Reactions ---
  public togglePostLike(postId: string, userId: string): { liked: boolean; count: number } {
    const index = this.data.likes.findIndex(l => l.post_id === postId && l.user_id === userId);
    let liked = false;
    if (index >= 0) {
      this.data.likes.splice(index, 1);
      liked = false;
    } else {
      this.data.likes.push({
        id: `lik-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        post_id: postId,
        user_id: userId,
        created_at: new Date().toISOString()
      });
      liked = true;

      // Notify post author
      const post = this.data.posts.find(p => p.id === postId);
      const user = this.findUserById(userId);
      if (post && post.author_id !== userId) {
        this.createNotification({
          user_id: post.author_id,
          actor_id: userId,
          type: 'like',
          title: 'Appreciation received',
          message: `${user?.name || 'Someone'} appreciated your story "${post.title.slice(0, 35)}..."`,
          link: `/story/${postId}`
        });
      }
    }

    const count = this.data.likes.filter(l => l.post_id === postId).length;
    this.scheduleSave();
    return { liked, count };
  }

  public setPostReaction(postId: string, userId: string, type: ReactionType): { reaction: ReactionType | null; counts: Record<ReactionType, number> } {
    const existingIndex = this.data.reactions.findIndex(r => r.post_id === postId && r.user_id === userId);
    let activeReaction: ReactionType | null = type;

    if (existingIndex >= 0) {
      if (this.data.reactions[existingIndex].type === type) {
        // Toggle off if same reaction
        this.data.reactions.splice(existingIndex, 1);
        activeReaction = null;
      } else {
        // Switch reaction
        this.data.reactions[existingIndex].type = type;
      }
    } else {
      this.data.reactions.push({
        id: `rea-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        user_id: userId,
        post_id: postId,
        type,
        created_at: new Date().toISOString()
      });

      // Notification
      const post = this.data.posts.find(p => p.id === postId);
      const user = this.findUserById(userId);
      if (post && post.author_id !== userId) {
        this.createNotification({
          user_id: post.author_id,
          actor_id: userId,
          type: 'like',
          title: 'New reaction',
          message: `${user?.name || 'Someone'} found your story "${post.title.slice(0, 35)}..." ${type}!`,
          link: `/story/${postId}`
        });
      }
    }

    const postReactions = this.data.reactions.filter(r => r.post_id === postId);
    const counts: Record<ReactionType, number> = {
      love: postReactions.filter(r => r.type === 'love').length,
      insightful: postReactions.filter(r => r.type === 'insightful').length,
      interesting: postReactions.filter(r => r.type === 'interesting').length,
      thinking: postReactions.filter(r => r.type === 'thinking').length
    };

    this.scheduleSave();
    return { reaction: activeReaction, counts };
  }

  // --- Bookmarks & Shelf ---
  public toggleBookmark(postId: string, userId: string, folder: ShelfFolder = 'recently_saved'): { bookmarked: boolean; folder: ShelfFolder | null } {
    const existingIndex = this.data.bookmarks.findIndex(b => b.post_id === postId && b.user_id === userId);
    let bookmarked = false;
    let finalFolder: ShelfFolder | null = null;

    if (existingIndex >= 0) {
      if (this.data.bookmarks[existingIndex].shelf_folder === folder) {
        // remove
        this.data.bookmarks.splice(existingIndex, 1);
        bookmarked = false;
        finalFolder = null;
      } else {
        // move to new folder
        this.data.bookmarks[existingIndex].shelf_folder = folder;
        bookmarked = true;
        finalFolder = folder;
      }
    } else {
      this.data.bookmarks.push({
        id: `bmk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        user_id: userId,
        post_id: postId,
        shelf_folder: folder,
        created_at: new Date().toISOString()
      });
      bookmarked = true;
      finalFolder = folder;
    }

    this.scheduleSave();
    return { bookmarked, folder: finalFolder };
  }

  public getSavedPosts(userId: string, folder?: ShelfFolder): PostWithDetails[] {
    const userBookmarks = this.data.bookmarks.filter(b => b.user_id === userId && (!folder || b.shelf_folder === folder));
    const postIds = userBookmarks.map(b => b.post_id);
    const posts = this.data.posts.filter(p => postIds.includes(p.id));
    return posts.map(p => this.enrichPost(p, userId));
  }

  // --- Social & Followers ---
  public toggleFollow(followerId: string, followingId: string): { following: boolean; followersCount: number } {
    if (followerId === followingId) throw new Error('Cannot follow yourself');
    const existingIndex = this.data.followers.findIndex(f => f.follower_id === followerId && f.following_id === followingId);
    let following = false;

    if (existingIndex >= 0) {
      this.data.followers.splice(existingIndex, 1);
      following = false;
    } else {
      this.data.followers.push({
        id: `fol-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        follower_id: followerId,
        following_id: followingId,
        created_at: new Date().toISOString()
      });
      following = true;

      // Notify followed author
      const follower = this.findUserById(followerId);
      this.createNotification({
        user_id: followingId,
        actor_id: followerId,
        type: 'follow',
        title: 'New follower',
        message: `${follower?.name || 'Someone'} joined your wave.`,
        link: `/profile/${follower?.username || ''}`
      });
    }

    const followersCount = this.data.followers.filter(f => f.following_id === followingId).length;
    this.scheduleSave();
    return { following, followersCount };
  }

  public isFollowing(followerId: string, followingId: string): boolean {
    return this.data.followers.some(f => f.follower_id === followerId && f.following_id === followingId);
  }

  public getUserSocialStats(userId: string): { followersCount: number; followingCount: number; postsCount: number; totalLikes: number } {
    const followersCount = this.data.followers.filter(f => f.following_id === userId).length;
    const followingCount = this.data.followers.filter(f => f.follower_id === userId).length;
    const userPosts = this.data.posts.filter(p => p.author_id === userId && p.status === 'published');
    const postsCount = userPosts.length;
    const userPostIds = userPosts.map(p => p.id);
    const totalLikes = this.data.likes.filter(l => userPostIds.includes(l.post_id)).length;

    return { followersCount, followingCount, postsCount, totalLikes };
  }

  // --- Notifications ---
  public createNotification(data: Omit<Notification, 'id' | 'is_read' | 'created_at'>): Notification {
    const notif: Notification = {
      ...data,
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      is_read: false,
      created_at: new Date().toISOString()
    };
    this.data.notifications.unshift(notif);
    this.scheduleSave();
    return notif;
  }

  public getNotifications(userId: string): Notification[] {
    return this.data.notifications.filter(n => n.user_id === userId);
  }

  public markNotificationAsRead(id: string, userId: string): boolean {
    const notif = this.data.notifications.find(n => n.id === id && n.user_id === userId);
    if (!notif) return false;
    notif.is_read = true;
    this.scheduleSave();
    return true;
  }

  public markAllNotificationsAsRead(userId: string): void {
    this.data.notifications
      .filter(n => n.user_id === userId)
      .forEach(n => { n.is_read = true; });
    this.scheduleSave();
  }

  // --- Dashboard Analytics ---
  public getCreatorAnalytics(authorId: string) {
    const posts = this.data.posts.filter(p => p.author_id === authorId);
    const published = posts.filter(p => p.status === 'published');
    const drafts = posts.filter(p => p.status === 'draft');

    const totalViews = published.reduce((acc, p) => acc + (p.views_count || 0), 0);
    const postIds = published.map(p => p.id);
    const totalLikes = this.data.likes.filter(l => postIds.includes(l.post_id)).length;
    const totalComments = this.data.comments.filter(c => postIds.includes(c.post_id)).length;
    const followers = this.data.followers.filter(f => f.following_id === authorId).length;

    // Time-series mock trend points based on publication dates & views
    const days = 7;
    const viewsOverTime = Array.from({ length: days }).map((_, i) => {
      const d = new Date(Date.now() - (6 - i) * 24 * 3600 * 1000);
      const label = d.toLocaleDateString('en-US', { weekday: 'short' });
      const factor = (i + 1) / 7;
      return {
        label,
        views: Math.round(totalViews * (0.08 + factor * 0.1)),
        likes: Math.round(totalLikes * (0.05 + factor * 0.12)),
        comments: Math.round(totalComments * (0.06 + factor * 0.1))
      };
    });

    const recentStories = posts.map(p => ({
      id: p.id,
      title: p.title,
      views: p.views_count || 0,
      likes: this.data.likes.filter(l => l.post_id === p.id).length,
      comments: this.data.comments.filter(c => c.post_id === p.id).length,
      status: p.status,
      published_at: p.published_at || p.created_at
    }));

    return {
      stats: {
        publishedCount: published.length,
        draftsCount: drafts.length,
        totalViews,
        totalLikes,
        totalComments,
        followers
      },
      timeSeries: viewsOverTime,
      recentStories
    };
  }
}

export const db = new RelationalDatabase();
