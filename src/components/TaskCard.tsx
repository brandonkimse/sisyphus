'use client';

import { GeneratedTask } from '@/app/actions/processVent';
import { Clock, Check } from 'lucide-react';

interface TaskCardProps {
  task: GeneratedTask;
  onUpdate: (updatedTask: GeneratedTask) => void;
  isSacrificed?: boolean;
}

export function TaskCard({ task, onUpdate, isSacrificed = false }: TaskCardProps) {
  
  const handleToggleComplete = () => {
    onUpdate({ ...task, is_completed: !task.is_completed });
  };

  // Determine Tag and Colors based on quadrant/complexity
  let tag = 'Schedule';
  let priorityColor = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  let priorityLabel = 'P2';

  if (isSacrificed) {
    tag = 'Sacrifice';
    priorityColor = 'bg-red-500/10 text-red-400 border-red-500/20';
    priorityLabel = 'Del';
  } else if (task.eisenhower_quadrant === 1) {
    tag = 'Do Now';
    priorityColor = 'bg-red-500/10 text-red-400 border-red-500/20';
    priorityLabel = 'P1';
  } else if (task.eisenhower_quadrant === 3) {
    tag = 'Quick Win';
    priorityColor = 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    priorityLabel = 'P3';
  } else if (task.eisenhower_quadrant === 2 && task.complexity >= 7) {
    tag = 'Deep Work';
    priorityColor = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  } else if (task.eisenhower_quadrant === 4) {
    tag = 'Low Value';
    priorityColor = 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    priorityLabel = 'P4';
  }

  const isCompleted = task.is_completed;

  return (
    <div 
      className={`group relative flex items-start gap-4 p-4 rounded-2xl border transition-all duration-300 ${
        isCompleted 
          ? 'bg-zinc-900/50 border-zinc-800/50 opacity-60' 
          : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 hover:shadow-lg hover:shadow-black/20'
      }`}
    >
      {/* Circular Completion Button */}
      <button 
        onClick={handleToggleComplete}
        className={`flex-shrink-0 mt-1 w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${
          isCompleted 
            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' 
            : 'border-zinc-700 hover:border-zinc-500 text-transparent hover:text-zinc-500'
        }`}
      >
        <Check className="w-4 h-4" />
      </button>

      {/* Task Content */}
      <div className="flex-1 min-w-0">
        <h3 className={`text-base font-medium transition-colors ${
          isCompleted ? 'text-zinc-500 line-through' : 'text-zinc-100'
        }`}>
          {task.title}
        </h3>
        
        {/* Pills */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          {/* Priority Pill */}
          <span className={`px-2 py-0.5 rounded-md text-xs font-medium border ${priorityColor}`}>
            {priorityLabel}
          </span>
          
          {/* Duration Pill */}
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-zinc-800 text-zinc-400 border border-zinc-700">
            <Clock className="w-3 h-3" />
            {task.estimated_minutes}m
          </span>

          {/* Tag Pill */}
          <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
            {tag}
          </span>
          
          {/* Sacrifice red tag if tired mode applies */}
          {isSacrificed && (
            <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
              Sacrifice
            </span>
          )}
        </div>
      </div>
      
      {/* Finish Button appears on hover */}
      {!isCompleted && (
        <button 
          onClick={handleToggleComplete}
          className="opacity-0 group-hover:opacity-100 absolute top-4 right-4 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-lg transition-all"
        >
          Finish
        </button>
      )}
    </div>
  );
}
