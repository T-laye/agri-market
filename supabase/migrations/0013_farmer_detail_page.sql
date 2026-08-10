-- Run this once in your Supabase project's SQL editor
-- (Dashboard > SQL Editor > New query), after 0012_farmer_favorites.sql.
--
-- Adds an avatar to the public farmer functions and a single-farmer
-- lookup, for the new farmer detail page (/marketplace/farmers/[id]).
-- Avatars live in auth.users.raw_user_meta_data, not farmer_profiles, so
-- this reads that table directly — same SECURITY DEFINER pattern as
-- everywhere else public farmer info comes from, and only ever exposes
-- the photo (never email, phone, or anything else off the user record).
--
-- get_public_farmers() already exists from 0012 with a different column
-- set (no avatar_url) — Postgres won't let CREATE OR REPLACE change a
-- table-returning function's output columns, so it has to be dropped
-- first.
drop function if exists get_public_farmers();

create function get_public_farmers()
returns table (id uuid, farm_name text, state text, product_count bigint, avatar_url text) as $$
	select
		f.id,
		f.farm_name,
		f.state,
		count(p.id) filter (where p.is_active = true) as product_count,
		coalesce(
			u.raw_user_meta_data ->> 'custom_avatar_url',
			u.raw_user_meta_data ->> 'avatar_url',
			u.raw_user_meta_data ->> 'picture'
		) as avatar_url
	from farmer_profiles f
	left join products p on p.farmer_id = f.id
	left join auth.users u on u.id = f.id
	where f.kyc_status = 'verified'
	group by f.id, f.farm_name, f.state, u.raw_user_meta_data;
$$ language sql security definer stable;

-- Single-farmer variant for the detail page — returns nothing (and the
-- page 404s) if the id doesn't exist or isn't a verified farmer.
create or replace function get_public_farmer(p_farmer_id uuid)
returns table (id uuid, farm_name text, state text, product_count bigint, avatar_url text) as $$
	select
		f.id,
		f.farm_name,
		f.state,
		count(p.id) filter (where p.is_active = true) as product_count,
		coalesce(
			u.raw_user_meta_data ->> 'custom_avatar_url',
			u.raw_user_meta_data ->> 'avatar_url',
			u.raw_user_meta_data ->> 'picture'
		) as avatar_url
	from farmer_profiles f
	left join products p on p.farmer_id = f.id
	left join auth.users u on u.id = f.id
	where f.kyc_status = 'verified' and f.id = p_farmer_id
	group by f.id, f.farm_name, f.state, u.raw_user_meta_data;
$$ language sql security definer stable;
