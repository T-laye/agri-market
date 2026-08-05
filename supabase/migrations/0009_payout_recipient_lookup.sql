-- Run this once in your Supabase project's SQL editor
-- (Dashboard > SQL Editor > New query), after 0008_farmer_payouts.sql.
--
-- Buyers have no RLS SELECT access to farmer_profiles (only the farmer
-- themselves and admins do) — but confirming delivery runs as the buyer,
-- and needs the farmer's Paystack recipient_code to trigger the payout.
-- Rather than widening farmer_profiles SELECT access, expose only this one
-- column through a SECURITY DEFINER function, which bypasses RLS
-- internally but only ever returns this single value.

create or replace function get_farmer_recipient_code(p_farmer_id uuid)
returns text as $$
	select paystack_recipient_code from farmer_profiles where id = p_farmer_id;
$$ language sql security definer stable;
