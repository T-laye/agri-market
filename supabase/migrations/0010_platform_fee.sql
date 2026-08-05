-- Run this once in your Supabase project's SQL editor
-- (Dashboard > SQL Editor > New query), after 0009_payout_recipient_lookup.sql.
--
-- AgriMarket now keeps a 5% platform fee on each paid order item. The
-- farmer's automatic Paystack transfer is for the remaining 95%
-- (payout_amount), and platform_fee_amount is recorded at the same time
-- so admin revenue stats don't have to recompute a rate that might change
-- later. Both are set once, when the buyer confirms delivery.

alter table order_items
	add column if not exists platform_fee_amount numeric,
	add column if not exists payout_amount numeric;
