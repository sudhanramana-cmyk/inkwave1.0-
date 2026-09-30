import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { Category } from '../types';
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  Quote,
  List,
  Code,
  Image as ImageIcon,
  Eye,
  Edit2,
  Send,
  Save,
  ArrowLeft,
  Clock,
  Sparkles
} from 'lucide-react';

interface WritePageProps {
  editPostId?: string;
  onNavigate: (path: string) => void;
}

const PRESET_COVERS = [
  { id: 'silence', label: 'Misty Ocean Wave', url: '/src/assets/images/inkwave_editorial_silence_1790787910935.jpg' },
  { id: 'tech', label: 'Analog Desk & Screen', url: '/src/assets/images/inkwave_editorial_technology_1790787894743.jpg' },
  { id: 'arch', label: 'Concrete Geometry', url: '/src/assets/images/inkwave_editorial_architecture_1790787881090.jpg' },
  { id: 'culture', label: 'Atelier & Sculpture', url: '/src/assets/images/inkwave_editorial_culture_1790787924551.jpg' }
];

export const WritePage: React.FC<WritePageProps> = ({ editPostId, onNavigate }) => {
  const { user, authModal } = useAuth();
  const { success, error } = useToast();

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [coverImage, setCoverImage] = useState(PRESET_COVERS[0].url);
  const [customCoverUrl, setCustomCoverUrl] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isPreview, setIsPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Load categories
  useEffect(() => {
    api.getCategories().then(cats => {
      setCategories(cats);
      if (cats.length > 0 && !categoryId) {
        setCategoryId(cats[0].id);
      }
    }).catch(() => {});
  }, []);

  // Load existing post if in edit mode
  useEffect(() => {
    if (editPostId) {
      api.getPost(editPostId).then(res => {
        const p = res.post;
        setTitle(p.title);
        setSubtitle(p.subtitle || '');
        setContent(p.content);
        setCategoryId(p.category_id);
        setCoverImage(p.cover_image);
        setTagsInput(p.tags.map(t => t.name).join(', '));
      }).catch(err => {
        error(err.message || 'Could not load story for editing');
      });
    }
  }, [editPostId]);

  // Calculate live stats
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const estimatedReadTime = Math.max(1, Math.ceil(wordCount / 200));

  // Insert markdown helpers
  const insertFormatting = (before: string, after: string = '') => {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const previousText = el.value;
    const selectedText = previousText.substring(start, end);

    const replacement = `${before}${selectedText || 'text'}${after}`;
    const newContent = previousText.substring(0, start) + replacement + previousText.substring(end);

    setContent(newContent);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + before.length, start + before.length + (selectedText.length || 4));
    }, 0);
  };

  const handleSave = async (status: 'published' | 'draft') => {
    if (!user) {
      authModal.open('login');
      return;
    }
    if (!title.trim()) {
      error('Please provide a title for your story');
      return;
    }
    if (!content.trim()) {
      error('Please write some content before saving');
      return;
    }

    setSubmitting(true);
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    const finalCover = customCoverUrl.trim() || coverImage;

    try {
      if (editPostId) {
        await api.updatePost(editPostId, {
          title: title.trim(),
          subtitle: subtitle.trim(),
          content,
          cover_image: finalCover,
          category_id: categoryId,
          tags,
          status
        });
        success(status === 'published' ? 'Story updated & published!' : 'Draft updated');
        onNavigate(`/story/${editPostId}`);
      } else {
        const res = await api.createPost({
          title: title.trim(),
          subtitle: subtitle.trim(),
          content,
          cover_image: finalCover,
          category_id: categoryId,
          tags,
          status
        });
        success(status === 'published' ? 'Story published to INKWAVE!' : 'Draft saved to your workspace');
        onNavigate(`/story/${res.post.id}`);
      }
    } catch (err: any) {
      error(err.message || 'Failed to save story');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Top action toolbar */}
      <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-5 mb-8">
        <button
          onClick={() => onNavigate('/')}
          className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit Editor</span>
        </button>

        {/* Live Word & Read Time */}
        <div className="flex items-center gap-4 text-xs text-stone-500 font-sans">
          <span>{wordCount} words</span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Approx. {estimatedReadTime} min read
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPreview(!isPreview)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              isPreview
                ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-400 text-blue-600 dark:text-blue-300'
                : 'border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            {isPreview ? <Edit2 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{isPreview ? 'Edit' : 'Preview'}</span>
          </button>

          <button
            onClick={() => handleSave('draft')}
            disabled={submitting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </button>

          <button
            onClick={() => handleSave('published')}
            disabled={submitting}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-stone-950 hover:bg-stone-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white transition-colors disabled:opacity-50 shadow-xs cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{submitting ? 'Publishing...' : 'Publish'}</span>
          </button>
        </div>
      </div>

      {isPreview ? (
        /* LIVE EDITORIAL PREVIEW */
        <div className="py-6 space-y-8 animate-in fade-in duration-150">
          <div className="p-3 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 rounded-xl text-xs text-blue-700 dark:text-blue-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Viewing live reader simulation</span>
            </span>
            <button onClick={() => setIsPreview(false)} className="underline font-semibold cursor-pointer">
              Return to editor
            </button>
          </div>

          <div className="max-w-2xl mx-auto space-y-6">
            {coverImage && (
              <img
                src={customCoverUrl || coverImage}
                alt="Cover"
                className="w-full h-72 object-cover rounded-2xl shadow-sm"
              />
            )}
            <h1 className="text-4xl sm:text-5xl font-serif font-bold text-stone-900 dark:text-stone-50 leading-tight">
              {title || 'Untitled Story'}
            </h1>
            {subtitle && (
              <p className="text-xl font-serif text-stone-600 dark:text-stone-300">
                {subtitle}
              </p>
            )}
            <div className="prose prose-stone dark:prose-invert max-w-none font-serif text-base sm:text-lg leading-relaxed whitespace-pre-line pt-4 border-t border-stone-200 dark:border-stone-800">
              {content || 'Your story text will be rendered here...'}
            </div>
          </div>
        </div>
      ) : (
        /* DISTRACTION-FREE WRITING CANVAS */
        <div className="space-y-6">
          
          {/* Title input */}
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Title of your story..."
            className="w-full text-3xl sm:text-4xl font-serif font-bold bg-transparent text-stone-900 dark:text-stone-50 placeholder-stone-400 focus:outline-none border-b border-stone-200 dark:border-stone-800 pb-3"
          />

          {/* Subtitle input */}
          <input
            type="text"
            value={subtitle}
            onChange={e => setSubtitle(e.target.value)}
            placeholder="Add an evocative subtitle or summary thesis..."
            className="w-full text-lg font-serif text-stone-700 dark:text-stone-300 placeholder-stone-400 bg-transparent focus:outline-none border-b border-stone-100 dark:border-stone-800/60 pb-2"
          />

          {/* Metadata selectors (Category & Tags) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
                Category
              </label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {c.description}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
                Themes & Tags (comma separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={e => setTagsInput(e.target.value)}
                placeholder="e.g. Architecture, Silence, Philosophy"
                className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Cover Image Selector */}
          <div className="pt-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">
              Cover Artwork
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
              {PRESET_COVERS.map(cover => (
                <div
                  key={cover.id}
                  onClick={() => {
                    setCoverImage(cover.url);
                    setCustomCoverUrl('');
                  }}
                  className={`relative h-20 rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                    coverImage === cover.url && !customCoverUrl
                      ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-xs'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={cover.url}
                    alt={cover.label}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-1 text-center">
                    <span className="text-[10px] text-white font-medium">
                      {cover.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customCoverUrl}
                onChange={e => setCustomCoverUrl(e.target.value)}
                placeholder="Or paste a custom image URL (https://...)"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Markdown Toolbar */}
          <div className="flex items-center gap-1.5 p-2 bg-stone-100 dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300">
            <button
              type="button"
              onClick={() => insertFormatting('**', '**')}
              className="p-1.5 hover:bg-white dark:hover:bg-stone-800 rounded-md transition-colors"
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('*', '*')}
              className="p-1.5 hover:bg-white dark:hover:bg-stone-800 rounded-md transition-colors"
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </button>
            <div className="w-[1px] h-4 bg-stone-300 dark:bg-stone-700 mx-1" />
            <button
              type="button"
              onClick={() => insertFormatting('### ')}
              className="p-1.5 hover:bg-white dark:hover:bg-stone-800 rounded-md transition-colors"
              title="Section Heading"
            >
              <Heading2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('> ')}
              className="p-1.5 hover:bg-white dark:hover:bg-stone-800 rounded-md transition-colors"
              title="Blockquote"
            >
              <Quote className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('- ')}
              className="p-1.5 hover:bg-white dark:hover:bg-stone-800 rounded-md transition-colors"
              title="Bullet list"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('```typescript\n', '\n```')}
              className="p-1.5 hover:bg-white dark:hover:bg-stone-800 rounded-md transition-colors"
              title="Code block"
            >
              <Code className="w-4 h-4" />
            </button>
          </div>

          {/* Prose Textarea */}
          <textarea
            ref={textareaRef}
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Tell your story. Ideas move when they are stated with precision..."
            rows={18}
            className="w-full p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white/70 dark:bg-stone-900/60 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-blue-500 font-serif text-base sm:text-lg leading-relaxed resize-y"
          />

        </div>
      )}

    </div>
  );
};
