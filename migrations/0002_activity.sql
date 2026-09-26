create table if not exists stroke_calls (
  id serial primary key,
  called_at timestamptz not null default now(),
  window_phase text not null,
  target text not null
);

create table if not exists page_reviews (
  id serial primary key,
  created_at timestamptz not null default now(),
  kind text not null,
  message text not null
);
