-- Run this once in your Supabase project's SQL editor
-- (Dashboard > SQL Editor > New query), after 0010_platform_fee.sql.
--
-- Real bug: the "Public can view active products from verified farmers"
-- policy on `products` checks farmer_profiles via a plain EXISTS
-- subquery — but farmer_profiles has its OWN row-level security, which
-- only lets a farmer see their own profile (or an admin see any profile).
-- RLS applies inside that subquery too, so for every visitor who ISN'T
-- that specific farmer or an admin, the EXISTS check silently evaluates
-- to false. Net effect: nobody could ever see anybody else's products —
-- not anonymous visitors, not buyers, not other farmers — regardless of
-- how many farmers were actually verified. The same problem breaks the
-- farmer_profiles(farm_name, kyc_status) embed used to show a product's
-- farmer name on the marketplace.
--
-- Fixed the same way admin/payout access already works elsewhere in this
-- project (0007, 0009): narrow SECURITY DEFINER functions that bypass
-- RLS internally but only ever expose non-sensitive fields (never phone,
-- bank details, or KYC documents).

create or replace function is_farmer_verified(p_farmer_id uuid)
returns boolean as $$
	select exists (
		select 1 from farmer_profiles
		where id = p_farmer_id and kyc_status = 'verified'
	);
$$ language sql security definer stable;

drop policy if exists "Public can view active products from verified farmers" on products;

create policy "Public can view active products from verified farmers"
on products for select
using (
	is_active = true
	and is_farmer_verified(farmer_id)
);

-- farm_name/kyc_status are meant to be public on the marketplace, unlike
-- the rest of farmer_profiles — this deliberately exposes only those two
-- columns, for whichever farmer ids the caller already legitimately has
-- (product rows they can already see).
create or replace function get_public_farmer_info(p_farmer_ids uuid[])
returns table (id uuid, farm_name text, kyc_status kyc_status) as $$
	select id, farm_name, kyc_status
	from farmer_profiles
	where id = any(p_farmer_ids);
$$ language sql security definer stable;
