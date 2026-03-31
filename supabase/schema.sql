-- Run this in your Supabase SQL editor (supabase.com → project → SQL editor)

-- Sessions (the available time slots Mark offers)
create table sessions (
  id          uuid primary key default gen_random_uuid(),
  sport       text not null,
  icon        text not null,
  name        text not null,
  day         text not null,
  time_slot   text not null,
  total_spots int not null default 6,
  sort_order  int not null default 0,
  created_at  timestamptz default now()
);

-- Bookings (each parent's request)
create table bookings (
  id           uuid primary key default gen_random_uuid(),
  session_id   uuid references sessions(id) on delete cascade,
  parent_name  text not null,
  kid_name     text not null,
  kid_age      text not null,
  contact_info text not null,
  notes        text,
  status       text not null default 'pending',
  created_at   timestamptz default now()
);

-- Seed some starter sessions
insert into sessions (sport, icon, name, day, time_slot, total_spots, sort_order) values
  ('baseball',   '⚾', 'Baseball Basics',    'Sat Apr 5',  '9:00 AM – 10:00 AM',  6, 1),
  ('basketball', '🏀', 'Hoop Fundamentals',  'Sat Apr 5',  '10:30 AM – 11:30 AM', 6, 2),
  ('football',   '🏈', 'First Down Skills',  'Sat Apr 5',  '12:00 PM – 1:00 PM',  6, 3),
  ('pickleball', '🏓', 'Pickle Intro',       'Sun Apr 6',  '9:00 AM – 10:00 AM',  6, 4),
  ('baseball',   '⚾', 'Baseball Basics',    'Sun Apr 6',  '10:30 AM – 11:30 AM', 6, 5),
  ('basketball', '🏀', 'Hoop Fundamentals',  'Wed Apr 9',  '4:30 PM – 5:30 PM',   6, 6),
  ('football',   '🏈', 'First Down Skills',  'Thu Apr 10', '4:30 PM – 5:30 PM',   6, 7),
  ('pickleball', '🏓', 'Pickle Intro',       'Sat Apr 12', '9:00 AM – 10:00 AM',  6, 8),
  ('baseball',   '⚾', 'Baseball Basics',    'Sat Apr 12', '10:30 AM – 11:30 AM', 6, 9);
