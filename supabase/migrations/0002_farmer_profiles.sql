-- Run this once in your Supabase project's SQL editor
-- (Dashboard > SQL Editor > New query), after 0001_avatars_bucket.sql.

create type kyc_status as enum ('not_submitted', 'pending', 'verified', 'rejected');

create table if not exists farmer_profiles (
	id uuid primary key references auth.users(id) on delete cascade,
	farm_name text not null,
	state text not null,
	phone text not null,
	kyc_status kyc_status not null default 'not_submitted',
	kyc_documents jsonb not null default '[]'::jsonb,
	rejection_reason text,
	verified_at timestamptz,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

alter table farmer_profiles enable row level security;

-- Farmers can read and update their own profile (but not kyc_status/verified_at —
-- those are admin-controlled; enforced via the trigger below, not RLS, since
-- column-level RLS would block the initial insert too).
create policy "Farmers can view their own profile"
on farmer_profiles for select
using (auth.uid() = id);

create policy "Farmers can create their own profile"
on farmer_profiles for insert
with check (auth.uid() = id);

create policy "Farmers can update their own profile"
on farmer_profiles for update
using (auth.uid() = id);

-- Prevent farmers from setting their own verification status via the update policy above.
-- (Admin verification will happen via the Supabase dashboard / service role until an
-- admin panel exists — this trigger just stops a farmer silently self-verifying.)
create or replace function prevent_self_kyc_approval()
returns trigger as $$
begin
	if auth.role() = 'authenticated' and (new.kyc_status is distinct from old.kyc_status) then
		if new.kyc_status not in ('pending') then
			raise exception 'kyc_status can only be set to pending by the account owner';
		end if;
	end if;
	return new;
end;
$$ language plpgsql security definer;

create trigger farmer_profiles_prevent_self_approval
before update on farmer_profiles
for each row execute function prevent_self_kyc_approval();

create or replace function set_updated_at()
returns trigger as $$
begin
	new.updated_at = now();
	return new;
end;
$$ language plpgsql;

create trigger farmer_profiles_set_updated_at
before update on farmer_profiles
for each row execute function set_updated_at();

-- Private bucket: only the owning farmer can read/write their own documents.
-- (No admin read policy yet — until an admin panel exists, review happens via
-- the Supabase dashboard using the service role, which bypasses RLS entirely.)
insert into storage.buckets (id, name, public)
values ('kyc-documents', 'kyc-documents', false)
on conflict (id) do nothing;

create policy "Farmers can upload their own KYC documents"
on storage.objects for insert
with check (
	bucket_id = 'kyc-documents'
	and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Farmers can view their own KYC documents"
on storage.objects for select
using (
	bucket_id = 'kyc-documents'
	and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Farmers can replace their own KYC documents"
on storage.objects for update
using (
	bucket_id = 'kyc-documents'
	and auth.uid()::text = (storage.foldername(name))[1]
);
