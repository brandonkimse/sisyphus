'use server';

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type GeneratedTask = {
  id: string;
  title: string;
  urgency: number;
  impact: number;
  complexity: number;
  estimated_minutes: number;
  eisenhower_quadrant: number;
  is_completed: boolean;
};

export type ProcessVentResponse = {
  tasks: GeneratedTask[];
  error?: string;
};

import { createClient } from '@/utils/supabase/server';

export async function processVentText(text: string): Promise<ProcessVentResponse> {
  if (!text || text.trim() === '') {
    return { tasks: [], error: 'Input text is empty.' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { tasks: [], error: 'You must be logged in to process tasks.' };
  }

  // Check Quota
  const { data: profile } = await supabase.from('profiles').select('vent_count, subscription_status').eq('id', user.id).single();
  
  if (profile) {
    // Temporarily disabled free limit check
    /*
    if (profile.vent_count >= 3 && profile.subscription_status !== 'active') {
      return { 
        tasks: [], 
        error: 'FREE_LIMIT_REACHED'
      };
    }
    */
  }

  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an intelligent task parsing engine. The user will provide a raw stream-of-consciousness text (a "brain dump").
Your goal is to extract the actionable tasks and score them according to these rules:
- Urgency (1-10): How time-sensitive is it based on explicit or implied deadlines?
- Impact (1-10): How heavily does this move the needle or alleviate anxiety?
- Complexity (1-10): How much cognitive load/focus does it require?
- Eisenhower Mapping:
  - Quadrant 1 (Do First): High Urgency, High Impact
  - Quadrant 2 (Schedule): Low Urgency, High Impact
  - Quadrant 3 (Delegate/Quick): High Urgency, Low Impact
  - Quadrant 4 (Delete/Minimize): Low Urgency, Low Impact

Provide a realistic estimated time to complete in minutes.

Output strictly in JSON format matching the schema provided.`,
        },
        {
          role: 'user',
          content: text,
        },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'tasks_schema',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              tasks: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    urgency: { type: 'number' },
                    impact: { type: 'number' },
                    complexity: { type: 'number' },
                    estimated_minutes: { type: 'number' },
                    eisenhower_quadrant: { type: 'number' },
                  },
                  required: [
                    'title',
                    'urgency',
                    'impact',
                    'complexity',
                    'estimated_minutes',
                    'eisenhower_quadrant',
                  ],
                  additionalProperties: false,
                },
              },
            },
            required: ['tasks'],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No content returned from AI');
    }

    const parsed = JSON.parse(content) as { tasks: Omit<GeneratedTask, 'id' | 'is_completed'>[] };
    
    const tasksToInsert = parsed.tasks.map(t => ({
      ...t,
      user_id: user.id,
      is_completed: false
    }));

    const { data: insertedTasks, error: insertError } = await supabase
      .from('tasks')
      .insert(tasksToInsert)
      .select();

    if (insertError) {
      console.error('Error inserting tasks into DB:', insertError);
      throw insertError;
    }

    // Increment usage
    if (user) {
      try {
        const { error: rpcError } = await supabase.rpc('increment_vent_count', { user_id: user.id });
        if (rpcError) throw rpcError;
      } catch (rpcErr) {
        console.warn('RPC increment_vent_count failed, falling back to direct update:', rpcErr);
        if (profile) {
          await supabase.from('profiles').update({ vent_count: (profile.vent_count || 0) + 1 }).eq('id', user.id);
        }
      }
    }

    return { tasks: (insertedTasks || []) as GeneratedTask[] };
  } catch (error) {
    console.error('Error parsing vent text with AI:', error);
    
    let insertedFallback: any[] | null = null;
    try {
      const fallbackTask = {
        user_id: user.id,
        title: text.length > 50 ? text.substring(0, 47) + '...' : text,
        urgency: 5,
        impact: 5,
        complexity: 5,
        estimated_minutes: 30,
        eisenhower_quadrant: 2,
        is_completed: false
      };
      const { data } = await supabase.from('tasks').insert([fallbackTask]).select();
      insertedFallback = data;
    } catch (dbErr) {
      console.error('Failed to write fallback task to database:', dbErr);
    }
    
    return {
      tasks: (insertedFallback || [
        {
          id: crypto.randomUUID(),
          title: text.length > 50 ? text.substring(0, 47) + '...' : text,
          urgency: 5,
          impact: 5,
          complexity: 5,
          estimated_minutes: 30,
          eisenhower_quadrant: 2,
          is_completed: false
        }
      ]) as GeneratedTask[],
      error: 'Failed to process intelligently. Created a fallback task.',
    };
  }
}
