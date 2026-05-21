'use server';

import { createClient } from '@/utils/supabase/server';
import { GeneratedTask } from './processVent';

export async function updateTaskAction(taskId: string, updates: Partial<GeneratedTask>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  const { error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', taskId)
    .eq('user_id', user.id);

  if (error) {
    console.error('Failed to update task in database:', error);
    throw error;
  }
}
