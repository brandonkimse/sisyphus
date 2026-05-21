-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    urgency INTEGER NOT NULL CHECK (urgency >= 1 AND urgency <= 10),
    impact INTEGER NOT NULL CHECK (impact >= 1 AND impact <= 10),
    complexity INTEGER NOT NULL CHECK (complexity >= 1 AND complexity <= 10),
    eisenhower_quadrant INTEGER NOT NULL CHECK (eisenhower_quadrant >= 1 AND eisenhower_quadrant <= 4),
    estimated_minutes INTEGER NOT NULL DEFAULT 15,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ensure all required columns exist in case the table already existed
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS estimated_minutes INTEGER NOT NULL DEFAULT 15;

-- Enable Row Level Security (RLS)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Create policy for users to select their own tasks
CREATE POLICY "Users can view their own tasks" 
ON public.tasks 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create policy for users to insert their own tasks
CREATE POLICY "Users can create their own tasks" 
ON public.tasks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own tasks
CREATE POLICY "Users can update their own tasks" 
ON public.tasks 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create policy for users to delete their own tasks
CREATE POLICY "Users can delete their own tasks" 
ON public.tasks 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index on user_id for faster lookups
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
-- Create index on created_at for chronological ordering
CREATE INDEX idx_tasks_created_at ON public.tasks(created_at DESC);
