import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserCheck, Shield, ChevronDown, Check } from 'lucide-react';

export const DemoSwitcher: React.FC = () => {
  const { user, quickSwitch } = useAuth();
  const [open, setOpen] = useState(false);

  const personas = [
    { id: 'elena', name: 'Elena Rostova', role: 'Design Essayist', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80' },
    { id: 'marcus', name: 'Marcus Vance', role: 'Systems Thinker', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80' },
    { id: 'sofia', name: 'Sofia Chen', role: 'Culture Critic', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80' },
    { id: 'admin', name: 'Arjun Mehta', role: 'Admin / Lead Curator', isAdmin: true, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80' }
  ];

  return (
    <div className="fixed bottom-6 left-6 z-40 hidden md:block">
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 px-3 py-1.5 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border border-stone-300/80 dark:border-stone-700/80 shadow-md rounded-full text-xs font-medium text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white transition-all cursor-pointer"
        >
          <UserCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Demo Account:</span>
          <span className="font-semibold text-stone-900 dark:text-stone-100 max-w-[90px] truncate">
            {user ? user.name.split(' ')[0] : 'Guest'}
          </span>
          <ChevronDown className="w-3 h-3 text-stone-400" />
        </button>

        {open && (
          <div className="absolute bottom-10 left-0 w-64 p-2 bg-[#FBF9F5] dark:bg-[#0E1526] border border-stone-200 dark:border-stone-800 rounded-xl shadow-2xl space-y-1 animate-in fade-in duration-150">
            <div className="px-2.5 py-1.5 text-[10px] uppercase tracking-wider text-stone-500 font-semibold border-b border-stone-200 dark:border-stone-800">
              Switch Persona
            </div>
            {personas.map(p => {
              const isActive = user?.username === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    quickSwitch(p.id);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200'
                      : 'hover:bg-stone-100 dark:hover:bg-stone-800/60 text-stone-800 dark:text-stone-200'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={p.avatar}
                      alt={p.name}
                      referrerPolicy="no-referrer"
                      className="w-6 h-6 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-semibold truncate flex items-center gap-1">
                        {p.name}
                        {p.isAdmin && <Shield className="w-3 h-3 text-blue-500 shrink-0" />}
                      </div>
                      <div className="text-[10px] text-stone-500 truncate">{p.role}</div>
                    </div>
                  </div>
                  {isActive && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 ml-1" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
