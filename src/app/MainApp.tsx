'use client';

import { useState } from 'react';
import { VentInterface } from '@/components/VentInterface';
import { Dashboard } from '@/components/Dashboard';
import { GeneratedTask } from '@/app/actions/processVent';
import { ModeToggle } from '@/components/ModeToggle';

import { logout } from '@/app/login/actions';
import { updateTaskAction } from '@/app/actions/updateTask';
import { LogOut, Crown, Loader2 } from 'lucide-react';

export default function MainApp({ 
  userEmail, 
  isPremium, 
  ventCount: _ventCount,
  initialTasks = []
}: { 
  userEmail: string; 
  isPremium: boolean; 
  ventCount: number; 
  initialTasks?: GeneratedTask[];
}) {
  const [tasks, setTasks] = useState<GeneratedTask[]>(initialTasks);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  const handleCheckout = async () => {
    setIsCheckoutLoading(true);
    try {
      const res = await fetch('/api/checkout', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  const handleTasksGenerated = (newTasks: GeneratedTask[]) => {
    setTasks((prev) => [...prev, ...newTasks]);
  };

  const handleUpdateTask = async (index: number, updatedTask: GeneratedTask) => {
    // 1. Optimistic UI update
    setTasks((prev) => {
      const copy = [...prev];
      copy[index] = updatedTask;
      return copy;
    });

    // 2. Persist to DB
    try {
      await updateTaskAction(updatedTask.id, {
        is_completed: updatedTask.is_completed
      });
    } catch (err) {
      console.error('Failed to update task database state:', err);
    }
  };

  return (
    <main className="min-h-screen">
      <div className="max-w-[1400px] mx-auto px-6 py-8 md:py-12">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
              Sisyphus.
            </h1>
            <p className="text-zinc-400">
              Prioritize your brain. Sacrifice the noise.
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-zinc-400">{userEmail}</span>
              {isPremium ? (
                <span className="flex items-center gap-1 text-emerald-400 font-medium bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                  <Crown className="w-4 h-4" /> Premium
                </span>
              ) : (
                /* Temporarily disabled free tier indicator */
                null
              )}
              <form action={logout}>
                <button type="submit" className="flex items-center gap-1 text-zinc-400 hover:text-white transition-colors">
                  <LogOut className="w-4 h-4" />
                </button>
              </form>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Temporarily disabled paid feature button */}
              {false && !isPremium && (
                <button
                  onClick={handleCheckout}
                  disabled={isCheckoutLoading}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1.5 rounded-full text-sm font-medium hover:shadow-lg hover:shadow-blue-500/20 transition-all disabled:opacity-50"
                >
                  {isCheckoutLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Upgrade to Premium
                </button>
              )}
              <ModeToggle />
            </div>
          </div>
        </header>

        {/* Split-screen Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
          {/* Left Column: Task Queue */}
          <div className="lg:col-span-7 xl:col-span-8 order-2 lg:order-1">
            <Dashboard tasks={tasks} onUpdateTask={handleUpdateTask} />
          </div>

          {/* Right Column: Brain Dump */}
          <div className="lg:col-span-5 xl:col-span-4 order-1 lg:order-2 lg:sticky lg:top-8">
            <VentInterface onTasksGenerated={handleTasksGenerated} />
          </div>
        </div>

        {/* Bottom Section: Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12 pt-12 border-t border-zinc-800/50">
          <InfoCard 
            title="Do Immediately" 
            desc="Urgent + Important" 
            color="bg-red-500/10 text-red-400 border-red-500/20"
          />
          <InfoCard 
            title="Schedule" 
            desc="Important, not urgent" 
            color="bg-blue-500/10 text-blue-400 border-blue-500/20"
          />
          <InfoCard 
            title="Delegate" 
            desc="Urgent, not important" 
            color="bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
          />
          <InfoCard 
            title="Delete / Sacrifice" 
            desc="Low Value" 
            color="bg-zinc-800 text-zinc-400 border-zinc-700"
          />
        </div>

      </div>
    </main>
  );
}

function InfoCard({ title, desc, color }: { title: string, desc: string, color: string }) {
  return (
    <div className={`p-5 rounded-2xl border ${color}`}>
      <h4 className="font-semibold mb-1">{title}</h4>
      <p className="text-sm opacity-80">{desc}</p>
    </div>
  );
}
