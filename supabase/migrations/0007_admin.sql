-- Run this once in your Supabase project's SQL editor
-- (Dashboard > SQL Editor > New query), after 0006_buyer_confirm_delivery.sql.
--
-- There's no self-serve way to become an admin (unlike is_farmer) — set
-- this manually for a trusted account once, via the Supabase table editor
-- or SQL editor:
--
--   update auth.users
--   set raw_user_meta_data = raw_user_meta_data || '{"is_admin": true}'::jsonb
--   where email = 'you@example.com';
--
-- The user must log out and back in afterward for the new JWT claim to
-- take effect (it's baked into the access token at sign-in).

create or replace function is_admin()
returns boolean as $$
	select coalesce((auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean, false);
$$ language sql stable;

-- The KYC self-approval guard (0002) blocks any 'authenticated' caller from
-- setting kyc_status to anything but 'pending' — that was meant to stop
-- farmers self-verifying, but it also blocks admins using their own login
-- (still 'authenticated', just with is_admin=true) from approving/rejecting
-- through the app. Redefine it to let admins through.
create or replace function prevent_self_kyc_approval()
returns trigger as $$
begin
	if auth.role() = 'authenticated' and not is_admin() and (new.kyc_status is distinct from old.kyc_status) then
		if new.kyc_status not in ('pending') then
			raise exception 'kyc_status can only be set to pending by the account owner';
		end if;
	end if;
	return new;
end;
$$ language plpgsql security definer;

-- Admin oversight: read/moderate everything, regardless of ownership.
create policy "Admins can view all farmer profiles"
on farmer_profiles for select
using (is_admin());

create policy "Admins can update all farmer profiles"
on farmer_profiles for update
using (is_admin());

create policy "Admins can view all products"
on products for select
using (is_admin());

create policy "Admins can update all products"
on products for update
using (is_admin());

create policy "Admins can view all orders"
on orders for select
using (is_admin());

create policy "Admins can view all order items"
on order_items for select
using (is_admin());

create policy "Admins can view all KYC documents"
on storage.objects for select
using (bucket_id = 'kyc-documents' and is_admin());
