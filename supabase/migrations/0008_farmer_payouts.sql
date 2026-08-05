-- Run this once in your Supabase project's SQL editor
-- (Dashboard > SQL Editor > New query), after 0007_admin.sql.

alter table farmer_profiles
	add column if not exists bank_code text,
	add column if not exists bank_name text,
	add column if not exists account_number text,
	add column if not exists account_name text,
	add column if not exists paystack_recipient_code text;

create type payout_status as enum ('not_applicable', 'pending', 'processing', 'paid', 'failed');

alter table order_items
	add column if not exists payout_status payout_status not null default 'not_applicable',
	add column if not exists payout_reference text,
	add column if not exists paid_out_at timestamptz;
