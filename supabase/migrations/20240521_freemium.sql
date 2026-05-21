-- 1. Safely create or update the profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text,
  vent_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure all required columns exist in case the table was already created by another app
alter table public.profiles add column if not exists stripe_customer_id text;
alter table public.profiles add column if not exists stripe_subscription_id text;
alter table public.profiles add column if not exists subscription_status text;
alter table public.profiles add column if not exists vent_count integer default 0;

-- 2. Enable RLS and define policies safely
alter table public.profiles enable row level security;

drop policy if exists "Users can view their own profile." on public.profiles;
create policy "Users can view their own profile."
  on public.profiles for select
  using ( auth.uid() = id );

drop policy if exists "Users can update their own profile." on public.profiles;
create policy "Users can update their own profile."
  on public.profiles for update
  using ( auth.uid() = id );

-- 3. Create a single robust trigger function
create or replace function public.handle_new_sisyphus_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- Use INSERT ON CONFLICT DO NOTHING to prevent duplicate key errors if the profile already exists
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

-- 4. Clean up any conflicting triggers so we only have one firing
drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists on_auth_user_created_sisyphus on auth.users;

create trigger on_auth_user_created_sisyphus
  after insert on auth.users
  for each row execute procedure public.handle_new_sisyphus_user();
