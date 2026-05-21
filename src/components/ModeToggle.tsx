'use client';

import { useVibe } from '@/context/VibeContext';

export function ModeToggle() {
  const { isBurntOut, toggleBurnout } = useVibe();

  return (
    <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-full p-1 shadow-sm">
      <button
        onClick={() => { if (isBurntOut) toggleBurnout(); }}
        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
          !isBurntOut 
            ? 'bg-zinc-800 text-zinc-100 shadow' 
            : 'text-zinc-400 hover:text-zinc-300'
        }`}
      >
        Focus Mode
      </button>
      <button
        onClick={() => { if (!isBurntOut) toggleBurnout(); }}
        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
          isBurntOut 
            ? 'bg-zinc-800 text-zinc-100 shadow' 
            : 'text-zinc-400 hover:text-zinc-300'
        }`}
      >
        Tired Mode
      </button>
    </div>
  );
}
