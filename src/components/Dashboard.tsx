'use client';

import { GeneratedTask } from '@/app/actions/processVent';
import { TaskCard } from './TaskCard';
import { useVibe } from '@/context/VibeContext';
import { generateSchedule } from '@/lib/scheduleEngine';
import { LayoutList, Trash } from 'lucide-react';

interface DashboardProps {
  tasks: GeneratedTask[];
  onUpdateTask: (originalIndex: number, updatedTask: GeneratedTask) => void;
}

export function Dashboard({ tasks, onUpdateTask }: DashboardProps) {
  const { isBurntOut } = useVibe();

  const blocks = generateSchedule(tasks, isBurntOut);

  const handleUpdate = (taskToUpdate: GeneratedTask, newValue: GeneratedTask) => {
    const origIndex = tasks.findIndex(t => t.id === taskToUpdate.id);
    if (origIndex !== -1) {
      onUpdateTask(origIndex, newValue);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-zinc-100 flex items-center gap-2">
          <LayoutList className="w-5 h-5 text-zinc-400" />
          Task Queue
        </h2>
        <p className="text-sm text-zinc-400 mt-1">
          Sorted using urgency, importance, and energy cost.
        </p>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {blocks.active.length === 0 && blocks.sacrificed.length === 0 && (
          <div className="text-center py-12 text-zinc-500 border border-dashed border-zinc-800 rounded-2xl">
            No tasks in queue. Add some from the Brain Dump.
          </div>
        )}

        {blocks.active.map((task) => (
          <TaskCard 
            key={task.id} 
            task={task} 
            onUpdate={(u) => handleUpdate(task, u)} 
          />
        ))}
      </div>

      {/* Tired Mode Sacrifice Card */}
      {isBurntOut && blocks.sacrificed.length > 0 && (
        <div className="mt-8 bg-zinc-900/50 border border-red-500/20 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
              <Trash className="w-5 h-5 text-red-500" />
              Suggested Sacrifice
            </h3>
            <span className="text-xs bg-red-500/10 text-red-400 px-2 py-1 rounded-full font-medium border border-red-500/20">
              Low Priority / Low Value
            </span>
          </div>
          <div className="space-y-3">
            {blocks.sacrificed.map((task) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onUpdate={(u) => handleUpdate(task, u)} 
                isSacrificed={true}
              />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
