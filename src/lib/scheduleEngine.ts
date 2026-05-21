import { GeneratedTask } from '@/app/actions/processVent';

export interface ScheduleBlocks {
  active: GeneratedTask[];
  sacrificed: GeneratedTask[];
}

export function generateSchedule(tasks: GeneratedTask[], isBurntOut: boolean): ScheduleBlocks {
  const active: GeneratedTask[] = [];
  const sacrificed: GeneratedTask[] = [];

  // Deep copy
  const processableTasks = tasks.map((t) => ({ ...t }));

  processableTasks.forEach((task) => {
    // If the task is completed, it should disappear from the UI
    if (task.is_completed) return;

    if (isBurntOut) {
      // Mode 2: Tired (Sacrifice Mode)
      // Delegate or Delete low priority tasks (Quadrant 3 and 4)
      // Puts absolute emphasis on urgent/high priority ones (Quadrant 1 and 2)
      if (task.eisenhower_quadrant === 3 || task.eisenhower_quadrant === 4) {
        sacrificed.push(task);
      } else {
        active.push(task);
      }
    } else {
      // Mode 1: All tasks active, organized by Eisenhower logic
      active.push(task);
    }
  });

  // Sort logic for active tasks:
  // 1. Eisenhower Quadrant (1 -> 2 -> 3 -> 4)
  // 2. Urgency (high to low)
  // 3. Impact (high to low)
  // 4. Length / estimated_minutes (low to high, to knock out quick things first)
  const sortTasks = (a: GeneratedTask, b: GeneratedTask) => {
    if (a.eisenhower_quadrant !== b.eisenhower_quadrant) {
      return a.eisenhower_quadrant - b.eisenhower_quadrant;
    }
    if (a.urgency !== b.urgency) {
      return b.urgency - a.urgency;
    }
    if (a.impact !== b.impact) {
      return b.impact - a.impact;
    }
    return a.estimated_minutes - b.estimated_minutes;
  };

  active.sort(sortTasks);
  sacrificed.sort(sortTasks);

  return { active, sacrificed };
}
