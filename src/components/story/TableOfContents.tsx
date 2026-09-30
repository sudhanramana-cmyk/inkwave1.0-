import React, { useEffect, useState } from 'react';
import { AlignLeft } from 'lucide-react';

interface TableOfContentsProps {
  content: string;
}

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ content }) => {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // Parse markdown headings like `### Heading` or `## Heading`
    const lines = content.split('\n');
    const items: TocItem[] = [];

    lines.forEach((line) => {
      const match = line.match(/^(#{2,3})\s+(.*)$/);
      if (match) {
        const level = match[1].length;
        const rawText = match[2].trim();
        const id = rawText.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        items.push({ id, text: rawText, level });
      }
    });

    setHeadings(items);
  }, [content]);

  if (headings.length === 0) return null;

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveId(id);
    }
  };

  return (
    <div className="hidden xl:block w-56 sticky top-28 self-start p-4 bg-white/40 dark:bg-stone-900/40 rounded-xl border border-stone-200/60 dark:border-stone-800/60 text-xs">
      <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-semibold mb-3">
        <AlignLeft className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
        <span className="uppercase tracking-wider text-[10px]">Outline</span>
      </div>
      <ul className="space-y-2">
        {headings.map((h, i) => (
          <li key={i} className={h.level === 3 ? 'pl-2' : ''}>
            <button
              onClick={() => scrollToHeading(h.id)}
              className={`text-left line-clamp-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${
                activeId === h.id
                  ? 'text-blue-600 dark:text-blue-400 font-semibold'
                  : 'text-stone-500 dark:text-stone-400'
              }`}
            >
              {h.text}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
