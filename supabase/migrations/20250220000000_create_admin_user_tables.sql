-- Create admin and user tables referencing auth.users
create table if not exists public.admin (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public."user" (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  full_name text,
  phone text,
  metadata jsonb not null default '{}'::jsonb
);

-- Ensure RLS is enabled for both tables
alter table public.admin enable row level security;
alter table public."user" enable row level security;

-- Allow admins to manage their own row and base users to manage their own row
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'admin' and polname = 'Admin can manage own record'
  ) then
    execute $$create policy "Admin can manage own record" on public.admin
      for all
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id)$$;
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'user' and polname = 'User can manage own record'
  ) then
    execute $$create policy "User can manage own record" on public."user"
      for all
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id)$$;
  end if;
end
$$;

-- Seed the requested admin account in auth and mirror tables
with created as (
  select auth.create_user(
    email => 'cherkinicolas@gmail.com',
    password => '2503997@',
    email_confirm => true,
    data => jsonb_build_object('role', 'admin')
  ) as user_record
),
uid as (
  select (user_record ->> 'id')::uuid as user_id,
         coalesce(user_record -> 'user_metadata', '{}'::jsonb) as metadata
  from created
)
insert into public."user" (user_id, metadata)
select user_id, metadata
from uid
on conflict (user_id) do update
  set metadata = excluded.metadata;

insert into public.admin (user_id, metadata)
select user_id, jsonb_build_object('role', 'admin')
from uid
on conflict (user_id) do update
  set metadata = excluded.metadata;
