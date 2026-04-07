-- Run this in your Supabase SQL Editor

-- Messages table
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  room_id text not null,
  user_id text not null,
  user_name text not null,
  user_color text not null,
  content text not null,
  verse_ref text,
  created_at timestamptz default now()
);

-- Index for fast room lookups
create index if not exists messages_room_id_idx on public.messages (room_id, created_at);

-- Enable Row Level Security
alter table public.messages enable row level security;

-- Allow anyone to read messages in a room
create policy "Anyone can read messages"
  on public.messages for select
  using (true);

-- Allow anyone to insert messages (no auth required for simplicity)
create policy "Anyone can insert messages"
  on public.messages for insert
  with check (true);

-- Enable Realtime for the messages table
alter publication supabase_realtime add table public.messages;
