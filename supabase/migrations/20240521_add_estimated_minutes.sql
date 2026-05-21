-- Add estimated_minutes column to tasks table if it doesn't exist
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS estimated_minutes INTEGER NOT NULL DEFAULT 15;
