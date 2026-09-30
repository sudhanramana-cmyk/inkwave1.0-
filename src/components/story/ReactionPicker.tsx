import React, { useState } from 'react';
import { ReactionType } from '../../types';
import confetti from 'canvas-confetti';

interface ReactionPickerProps {
  counts: Record<ReactionType, number>;
  userReaction?: ReactionType | null;
  onReact: (type: ReactionType) => void;
  disabled?: boolean;
}

export const ReactionPicker: React.FC<ReactionPickerProps> = ({
  counts,
  userReaction,
  onReact,
  disabled
}) => {
  const [animatingType, setAnimatingType] = useState<ReactionType | null>(null);

  const reactions: Array<{ type: ReactionType; emoji: string; label: string }> = [
    { type: 'love', emoji: '❤️', label: 'Loved it' },
    { type: 'insightful', emoji: '💡', label: 'Insightful' },
    { type: 'interesting', emoji: '🔥', label: 'Interesting' },
    { type: 'thinking', emoji: '🤔', label: 'Made me think' }
  ];

  const handleClick = (type: ReactionType, e: React.MouseEvent) => {
    if (disabled) return;

    // Trigger subtle confetti burst if choosing a new positive reaction
    if (userReaction !== type) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;

      try {
        confetti({
          particleCount: 18,
          spread: 45,
          origin: { x, y },
          colors: ['#3b82f6', '#f97316', '#10b981', '#fbbf24'],
          disableForReducedMotion: true
        });
      } catch {
        // Safe fallback
      }
    }

    setAnimatingType(type);
    setTimeout(() => setAnimatingType(null), 300);
    onReact(type);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {reactions.map(r => {
        const isSelected = userReaction === r.type;
        const isAnimating = animatingType === r.type;
        const count = counts[r.type] || 0;

        return (
          <button
            key={r.type}
            type="button"
            disabled={disabled}
            onClick={(e) => handleClick(r.type, e)}
            className={`group relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
              isSelected
                ? 'bg-blue-100/80 dark:bg-blue-950/80 border border-blue-400 dark:border-blue-600 text-blue-900 dark:text-blue-100 shadow-xs'
                : 'bg-white/60 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800/80'
            } ${isAnimating ? 'scale-110' : 'scale-100'}`}
            title={r.label}
          >
            <span className="text-base select-none transition-transform group-hover:scale-115">
              {r.emoji}
            </span>
            <span className="font-sans tabular-nums text-xs font-semibold">
              {count}
            </span>
            <span className="hidden sm:inline text-[11px] text-stone-500 dark:text-stone-400 font-normal">
              {r.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
