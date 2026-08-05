-- Run this once in your Supabase project's SQL editor
-- (Dashboard > SQL Editor > New query), after 0004_orders.sql.
--
-- The PRD's order flow ends Delivered -> Completed (the buyer confirming
-- delivery is what should eventually trigger escrow fund release), but the
-- original order_item_status enum stopped at 'delivered'. This adds the
-- missing terminal state.

alter type order_item_status add value if not exists 'completed';
