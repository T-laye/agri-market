-- Run this once in your Supabase project's SQL editor
-- (Dashboard > SQL Editor > New query), after 0002_farmer_profiles.sql.

create extension if not exists pgcrypto;

create type product_category as enum ('Vegetables', 'Fruits', 'Tubers & Roots', 'Grains & Legumes');

create table if not exists products (
	id uuid primary key default gen_random_uuid(),
	farmer_id uuid not null references farmer_profiles(id) on delete cascade,
	name text not null,
	category product_category not null,
	price numeric(12, 2) not null check (price > 0),
	unit text not null,
	quantity integer not null default 0 check (quantity >= 0),
	description text not null default '',
	images jsonb not null default '[]'::jsonb,
	location text not null,
	address text not null,
	is_active boolean not null default true,
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

create index if not exists products_farmer_id_idx on products(farmer_id);
create index if not exists products_is_active_idx on products(is_active);

alter table products enable row level security;

create trigger products_set_updated_at
before update on products
for each row execute function set_updated_at();

-- Public marketplace visibility: only active products from verified farmers.
create policy "Public can view active products from verified farmers"
on products for select
using (
	is_active = true
	and exists (
		select 1 from farmer_profiles
		where farmer_profiles.id = products.farmer_id
		and farmer_profiles.kyc_status = 'verified'
	)
);

-- Farmers always see all of their own products, regardless of status.
create policy "Farmers can view their own products"
on products for select
using (auth.uid() = farmer_id);

-- The farmer_id -> farmer_profiles foreign key already guarantees the farmer
-- is onboarded; this just scopes inserts to the caller's own id.
create policy "Farmers can insert their own products"
on products for insert
with check (auth.uid() = farmer_id);

create policy "Farmers can update their own products"
on products for update
using (auth.uid() = farmer_id);

create policy "Farmers can delete their own products"
on products for delete
using (auth.uid() = farmer_id);

-- Public bucket: product photos are meant to be publicly viewable, like avatars.
-- Farmers can only write into a folder named after their own user id
-- (upload path convention used by the app: {farmer_id}/<filename>).
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "Product images are publicly accessible"
on storage.objects for select
using (bucket_id = 'product-images');

create policy "Farmers can upload their own product images"
on storage.objects for insert
with check (
	bucket_id = 'product-images'
	and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Farmers can update their own product images"
on storage.objects for update
using (
	bucket_id = 'product-images'
	and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Farmers can delete their own product images"
on storage.objects for delete
using (
	bucket_id = 'product-images'
	and auth.uid()::text = (storage.foldername(name))[1]
);
