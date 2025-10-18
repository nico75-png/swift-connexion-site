-- Create profiles table to store user names
create table if not exists public.profiles (
  user_id uuid primary key references auth.users on delete cascade,
  first_name text not null,
  last_name text not null,
  display_name text generated always as (trim(both from concat_ws(' ', first_name, last_name))) stored,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile" on public.profiles
  for select using (auth.uid() = user_id);

create policy "Users can insert their profile" on public.profiles
  for insert with check (auth.uid() = user_id);

create policy "Users can update their profile" on public.profiles
  for update using (auth.uid() = user_id);

