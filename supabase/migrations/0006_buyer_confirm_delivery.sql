-- Run this once in your Supabase project's SQL editor
-- (Dashboard > SQL Editor > New query), after 0005_order_completed_status.sql.
--
-- Buyers had no UPDATE policy on order_items at all, which blocks the
-- "confirm delivery" action (delivered -> completed) a buyer needs to
-- perform on their own order. The app only ever sets `status` here (and
-- only delivered -> completed), but RLS itself doesn't restrict which
-- columns change — that's enforced in the server action, same pattern as
-- the farmer_profiles kyc_status trigger.

create policy "Buyers can confirm delivery on their own order items"
on order_items for update
using (auth.uid() = buyer_id);
