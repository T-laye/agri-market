-- Run this once in your Supabase project's SQL editor
-- (Dashboard > SQL Editor > New query), after 0003_products.sql.

create type payment_status as enum ('pending', 'paid', 'failed');
create type order_item_status as enum (
	'pending',
	'accepted',
	'preparing',
	'in_transit',
	'delivered',
	'cancelled'
);

create table if not exists orders (
	id uuid primary key default gen_random_uuid(),
	buyer_id uuid not null references auth.users(id) on delete cascade,
	total_amount numeric(12, 2) not null check (total_amount > 0),
	delivery_state text not null,
	delivery_city text,
	delivery_address text not null,
	delivery_landmark text,
	payment_reference text unique,
	payment_status payment_status not null default 'pending',
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

create table if not exists order_items (
	id uuid primary key default gen_random_uuid(),
	order_id uuid not null references orders(id) on delete cascade,
	buyer_id uuid not null references auth.users(id) on delete cascade,
	farmer_id uuid not null references farmer_profiles(id) on delete cascade,
	product_id uuid references products(id) on delete set null,
	product_name text not null,
	product_image text,
	unit_price numeric(12, 2) not null check (unit_price > 0),
	unit text not null,
	quantity integer not null check (quantity > 0),
	status order_item_status not null default 'pending',
	created_at timestamptz not null default now(),
	updated_at timestamptz not null default now()
);

create index if not exists orders_buyer_id_idx on orders(buyer_id);
create index if not exists order_items_order_id_idx on order_items(order_id);
create index if not exists order_items_buyer_id_idx on order_items(buyer_id);
create index if not exists order_items_farmer_id_idx on order_items(farmer_id);

alter table orders enable row level security;
alter table order_items enable row level security;

create trigger orders_set_updated_at
before update on orders
for each row execute function set_updated_at();

create trigger order_items_set_updated_at
before update on order_items
for each row execute function set_updated_at();

-- Buyers see their own orders. Farmers see any order that contains at
-- least one of their own items (they don't need visibility into the
-- buyer's other farmers' items, but the order row itself — address,
-- payment status — is shared context for fulfilling their part of it).
create policy "Buyers can view their own orders"
on orders for select
using (auth.uid() = buyer_id);

create policy "Farmers can view orders containing their items"
on orders for select
using (
	exists (
		select 1 from order_items
		where order_items.order_id = orders.id
		and order_items.farmer_id = auth.uid()
	)
);

create policy "Buyers can create their own orders"
on orders for insert
with check (auth.uid() = buyer_id);

-- Needed so the checkout callback (running as the buyer) can mark payment
-- as paid/failed after verifying with Paystack.
create policy "Buyers can update their own orders"
on orders for update
using (auth.uid() = buyer_id);

create policy "Buyers can view their own order items"
on order_items for select
using (auth.uid() = buyer_id);

create policy "Farmers can view their own order items"
on order_items for select
using (auth.uid() = farmer_id);

create policy "Buyers can create their own order items"
on order_items for insert
with check (auth.uid() = buyer_id);

-- Farmers move their own items through pending -> accepted -> ... -> delivered.
create policy "Farmers can update their own order items"
on order_items for update
using (auth.uid() = farmer_id);
