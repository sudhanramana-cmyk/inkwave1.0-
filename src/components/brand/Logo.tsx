import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', showTagline = false }) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Unique stylized "I" + wave/open pages glyph */}
      <div className={`relative ${iconSizes[size]} flex items-center justify-center shrink-0`}>
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm"
        >
          {/* Background subtle geometry */}
          <rect width="36" height="36" rx="8" className="fill-stone-900 dark:fill-stone-800" />
          {/* Upper wave crest representing the open mind / page */}
          <path
            d="M9 10C13 8 16 12 21 10C24 8.8 26 9.5 27 10"
            stroke="#60A5FA"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Central spine of the 'I' fluidly transforming into an ink wave */}
          <path
            d="M18 10V26"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Lower wave crest forming the book base / foundation */}
          <path
            d="M9 26C13 24 16 28 21 26C24 24.8 26 25.5 27 26"
            stroke="#F97316"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="flex flex-col">
        <span className={`font-serif font-bold tracking-tight text-stone-950 dark:text-stone-50 ${textSizes[size]}`}>
          INKWAVE
        </span>
        {showTagline && (
          <span className="text-[10px] tracking-wider text-stone-500 uppercase font-sans -mt-0.5">
            Ideas move · Stories stay
          </span>
        )}
      </div>
    </div>
  );
};
