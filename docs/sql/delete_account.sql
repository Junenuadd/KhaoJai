-- KhaoJai: let a signed-in learner delete their own account (required by Google Play and the App Store).
-- Run once in Supabase → SQL Editor (project KaoJai). Safe to run again.
-- The function runs with the owner's rights but only ever deletes the caller's own row (auth.uid()).

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if auth.uid() is null then
    raise exception 'not signed in';
  end if;
  delete from public.progress where user_id = auth.uid();
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
