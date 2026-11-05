alter table public.championships
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

create index if not exists championships_user_id_idx
  on public.championships(user_id);

alter table public.championships enable row level security;

drop policy if exists "Championships visible to authenticated owners" on public.championships;
create policy "Championships visible to authenticated owners"
  on public.championships
  as restrictive
  for select
  to public
  using (user_id is null or user_id = (select auth.uid()));

drop policy if exists "Championships readable by authenticated owners" on public.championships;
create policy "Championships readable by authenticated owners"
  on public.championships
  for select
  to authenticated
  using (user_id is null or user_id = (select auth.uid()));

drop policy if exists "Championships inserts restricted to owner" on public.championships;
create policy "Championships inserts restricted to owner"
  on public.championships
  as restrictive
  for insert
  to public
  with check (user_id = (select auth.uid()));

drop policy if exists "Users can create their own championships" on public.championships;
create policy "Users can create their own championships"
  on public.championships
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "Championship updates restricted to owner" on public.championships;
create policy "Championship updates restricted to owner"
  on public.championships
  as restrictive
  for update
  to public
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "Users can update their own championships" on public.championships;
create policy "Users can update their own championships"
  on public.championships
  for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "Championships deletes restricted to owner" on public.championships;
create policy "Championships deletes restricted to owner"
  on public.championships
  as restrictive
  for delete
  to public
  using (user_id = (select auth.uid()));

drop policy if exists "Users can delete their own championships" on public.championships;
create policy "Users can delete their own championships"
  on public.championships
  for delete
  to authenticated
  using (user_id = (select auth.uid()));
