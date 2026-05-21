import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import MainApp from './MainApp';

export default async function Page() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  const isPremium = profile?.subscription_status === 'active';
  const ventCount = profile?.vent_count || 0;

  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const initialTasks = (tasks || []).map(t => ({
    id: t.id,
    title: t.title,
    urgency: t.urgency,
    impact: t.impact,
    complexity: t.complexity,
    estimated_minutes: t.estimated_minutes,
    eisenhower_quadrant: t.eisenhower_quadrant,
    is_completed: t.is_completed
  }));

  return (
    <MainApp 
      userEmail={user.email || ''} 
      isPremium={isPremium} 
      ventCount={ventCount} 
      initialTasks={initialTasks}
    />
  );
}
