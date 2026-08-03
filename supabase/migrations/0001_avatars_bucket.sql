-- Run this once in your Supabase project's SQL editor
-- (Dashboard > SQL Editor > New query) before using profile picture uploads.

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Anyone can view avatars (they're public profile pictures)
create policy "Avatar images are publicly accessible"
on storage.objects for select
using (bucket_id = 'avatars');

-- Users can only upload into a folder named after their own user id
-- (upload path convention used by the app: {user_id}/avatar.<ext>)
create policy "Users can upload their own avatar"
on storage.objects for insert
with check (
	bucket_id = 'avatars'
	and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can update their own avatar"
on storage.objects for update
using (
	bucket_id = 'avatars'
	and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can delete their own avatar"
on storage.objects for delete
using (
	bucket_id = 'avatars'
	and auth.uid()::text = (storage.foldername(name))[1]
);
