import React, { useState } from 'react';
import { X, Check, Copy, Share2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, title, url }) => {
  const [copied, setCopied] = useState(false);
  const { success } = useToast();

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      success('Link copied to clipboard');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const shareToTwitter = () => {
    const text = encodeURIComponent(`"${title}" on INKWAVE — Ideas move. Stories stay.\n\n${url}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  const shareToLinkedIn = () => {
    const link = encodeURIComponent(url);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${link}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-sm bg-[#FBF9F5] dark:bg-[#0E1526] border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xl p-6"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-1"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <Share2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h3 className="font-serif font-semibold text-lg text-stone-900 dark:text-stone-100">
            Share this thought
          </h3>
        </div>
        <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 mb-5">
          {title}
        </p>

        {/* Copy field */}
        <div className="flex items-center gap-2 p-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 mb-4">
          <input
            type="text"
            readOnly
            value={url}
            className="w-full bg-transparent text-xs text-stone-800 dark:text-stone-200 px-2 py-1 outline-none truncate"
          />
          <button
            onClick={handleCopy}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-medium rounded-md transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Social channels */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={shareToTwitter}
            className="py-2 px-3 border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800/60 rounded-lg text-stone-800 dark:text-stone-200 font-medium transition-colors text-center"
          >
            X / Twitter
          </button>
          <button
            onClick={shareToLinkedIn}
            className="py-2 px-3 border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800/60 rounded-lg text-stone-800 dark:text-stone-200 font-medium transition-colors text-center"
          >
            LinkedIn
          </button>
        </div>
      </div>
    </div>
  );
};
