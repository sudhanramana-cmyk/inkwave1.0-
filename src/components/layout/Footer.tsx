import React from 'react';
import { Logo } from '../brand/Logo';
import { Globe, Github, Twitter, BookmarkCheck, ArrowUpRight } from 'lucide-react';

interface FooterProps {
  onNavigate: (path: string) => void;
  onOpenShortcuts?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenShortcuts }) => {
  return (
    <footer className="border-t border-stone-200 dark:border-stone-800 bg-[#F5F2EB]/50 dark:bg-[#060A12]/60 transition-colors mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <Logo size="md" showTagline />
            <p className="text-sm text-stone-600 dark:text-stone-400 max-w-md leading-relaxed font-serif">
              An independent publishing forum built for deep inquiry, intentional dialogue, and lasting ideas. Designed without attention-harvesting feeds or reactionary friction.
            </p>
            <div className="flex items-center gap-4 text-stone-400 dark:text-stone-500 pt-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
                aria-label="Global Network"
              >
                <Globe className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-900 dark:text-stone-100 mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm text-stone-600 dark:text-stone-400">
              <li>
                <button onClick={() => onNavigate('/')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Frontpage Stream
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/discover')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Curated Catalog
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/shelf')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Reading Shelf
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/write')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Distraction-free Editor
                </button>
              </li>
            </ul>
          </div>

          {/* Institutional & Ethics */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-900 dark:text-stone-100 mb-4">
              Platform & Ethos
            </h4>
            <ul className="space-y-2.5 text-sm text-stone-600 dark:text-stone-400">
              <li>
                <span className="cursor-default hover:text-stone-900 dark:hover:text-stone-200">
                  Community Guidelines
                </span>
              </li>
              <li>
                <span className="cursor-default hover:text-stone-900 dark:hover:text-stone-200">
                  Privacy & Data Sovereignty
                </span>
              </li>
              <li>
                <span className="cursor-default hover:text-stone-900 dark:hover:text-stone-200">
                  Editorial Charter
                </span>
              </li>
              <li>
                {onOpenShortcuts && (
                  <button
                    onClick={onOpenShortcuts}
                    className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline pt-1"
                  >
                    <span>Keyboard shortcuts (?)</span>
                  </button>
                )}
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom hairline & copyright */}
        <div className="pt-8 border-t border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <div>
            © {new Date().getFullYear()} INKWAVE Publishing Platform. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <BookmarkCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Independent & Human-Authored</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
