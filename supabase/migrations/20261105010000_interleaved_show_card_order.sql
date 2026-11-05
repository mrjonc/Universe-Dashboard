alter table public.matches
  add column if not exists card_order integer;

alter table public.segments
  add column if not exists card_order integer;
