-- Run this once in your Supabase project's SQL editor
-- (Dashboard > SQL Editor > New query), after 0013_farmer_detail_page.sql.
--
-- Lets a buyer and farmer call each other once an order item has been
-- accepted (or moved further along) — nothing revealed while it's still
-- pending, nothing for cancelled items.
--
-- The buyer's contact number is collected at checkout (below) and stored
-- on the order itself, which farmers already have RLS SELECT on — no new
-- plumbing needed for that direction.
--
-- The farmer's number lives on farmer_profiles, which is NOT visible to
-- buyers via RLS (same class of issue as 0011/0012) — this exposes it
-- only for farmers the calling buyer actually has an active order with,
-- same SECURITY DEFINER pattern used throughout this project.

alter table orders add column if not exists contact_phone text;

create or replace function get_order_farmer_phones(p_farmer_ids uuid[])
returns table (farmer_id uuid, phone text) as $$
	select f.id as farmer_id, f.phone
	from farmer_profiles f
	where f.id = any(p_farmer_ids)
	and exists (
		select 1 from order_items oi
		where oi.farmer_id = f.id
		and oi.buyer_id = auth.uid()
		and oi.status not in ('pending', 'cancelled')
	);
$$ language sql security definer stable;
