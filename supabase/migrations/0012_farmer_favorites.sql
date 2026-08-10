-- Run this once in your Supabase project's SQL editor
-- (Dashboard > SQL Editor > New query), after 0011_fix_marketplace_visibility.sql.

create table if not exists farmer_favorites (
	buyer_id uuid not null references auth.users(id) on delete cascade,
	farmer_id uuid not null references farmer_profiles(id) on delete cascade,
	created_at timestamptz not null default now(),
	primary key (buyer_id, farmer_id)
);

alter table farmer_favorites enable row level security;

create policy "Users can view their own favorite farmers"
on farmer_favorites for select
using (auth.uid() = buyer_id);

create policy "Users can add their own favorite farmers"
on farmer_favorites for insert
with check (auth.uid() = buyer_id);

create policy "Users can remove their own favorite farmers"
on farmer_favorites for delete
using (auth.uid() = buyer_id);

-- Public "Farmers" section on the marketplace — every verified farmer
-- (unverified farmers still aren't publicly browsable, same rule as
-- product visibility) with a live count of their active listings.
-- SECURITY DEFINER for the same reason as get_public_farmer_info in
-- 0011: farmer_profiles' own RLS would otherwise hide every farmer from
-- everyone but themselves and admins.
create or replace function get_public_farmers()
returns table (id uuid, farm_name text, state text, product_count bigint) as $$
	select
		f.id,
		f.farm_name,
		f.state,
		count(p.id) filter (where p.is_active = true) as product_count
	from farmer_profiles f
	left join products p on p.farmer_id = f.id
	where f.kyc_status = 'verified'
	group by f.id, f.farm_name, f.state;
$$ language sql security definer stable;
