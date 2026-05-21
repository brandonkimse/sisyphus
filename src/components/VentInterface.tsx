'use client';

import { useState } from 'react';
import { processVentText, GeneratedTask } from '@/app/actions/processVent';
import { Loader2, Plus } from 'lucide-react';

interface VentInterfaceProps {
  onTasksGenerated: (tasks: GeneratedTask[]) => void;
}

export function VentInterface({ onTasksGenerated }: VentInterfaceProps) {
  const [text, setText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const handleProcess = async () => {
    if (!text.trim()) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const response = await processVentText(text);
      if (response.error) {
        if (response.error === 'FREE_LIMIT_REACHED') {
          setError('You have reached your 3 free uses! Please upgrade to Premium to continue.');
        } else {
          setError(response.error);
        }
        return;
      }
      
      if (response.tasks && response.tasks.length > 0) {
        onTasksGenerated(response.tasks);
      }
      setText(''); // clear after success
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-lg">
      <div>
        <h2 className="text-xl font-semibold text-zinc-100">Brain Dump</h2>
        <p className="text-sm text-zinc-400 mt-1">
          Type naturally. AI organizes everything for you.
        </p>
      </div>
      
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="e.g. Need to email Sarah about the Q3 report, pick up groceries, and draft the new landing page copy."
        className="w-full min-h-[250px] p-4 text-base bg-zinc-950 border border-zinc-800 rounded-xl resize-none focus:outline-none focus:ring-1 focus:ring-zinc-700 text-zinc-200 placeholder:text-zinc-600 transition-all"
        disabled={isProcessing}
      />
      
      <button
        onClick={handleProcess}
        disabled={isProcessing || !text.trim()}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-zinc-100 text-zinc-900 font-medium rounded-xl hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isProcessing ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Plus className="w-5 h-5" />
        )}
        {isProcessing ? 'Organizing...' : 'Add Tasks'}
      </button>

      {error && (
        <div className="mt-2 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg text-center font-medium">
          {error}
        </div>
      )}
    </div>
  );
}
