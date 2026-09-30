import React from 'react';
import { X, Command } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'N', desc: 'Compose a new story' },
    { key: '/', desc: 'Focus global search' },
    { key: 'G', desc: 'Go to home stream' },
    { key: 'S', desc: 'Open reading shelf' },
    { key: '?', desc: 'Toggle keyboard shortcuts' },
    { key: 'Esc', desc: 'Close dialogs or overlays' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-sm bg-[#FBF9F5] dark:bg-[#0E1526] border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xl p-6"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-1"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <Command className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h3 className="font-serif font-semibold text-lg text-stone-900 dark:text-stone-100">
            Keyboard Navigations
          </h3>
        </div>

        <div className="space-y-2.5">
          {shortcuts.map(s => (
            <div key={s.key} className="flex items-center justify-between text-xs py-1 border-b border-stone-200/60 dark:border-stone-800/60 last:border-none">
              <span className="text-stone-600 dark:text-stone-400">{s.desc}</span>
              <kbd className="px-2 py-0.5 font-mono text-[11px] font-semibold bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 rounded border border-stone-300 dark:border-stone-700 shadow-xs">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
