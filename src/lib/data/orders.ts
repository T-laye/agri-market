import type { SupabaseClient } from "@supabase/supabase-js";

export type PaymentStatus = "pending" | "paid" | "failed";
export type OrderItemStatus =
	| "pending"
	| "accepted"
	| "preparing"
	| "in_transit"
	| "delivered"
	| "completed"
	| "cancelled";

// The sequence a farmer walks an item through. "completed" is buyer-only
// (confirming delivery), and "cancelled" can happen from most states, so
// neither appears here — this is just "what's the farmer's next step".
export const FARMER_STATUS_SEQUENCE: OrderItemStatus[] = [
	"pending",
	"accepted",
	"preparing",
	"in_transit",
	"delivered",
];

export type PayoutStatus = "not_applicable" | "pending" | "processing" | "paid" | "failed";

/** AgriMarket's cut of each paid order item. The farmer's payout is the
 * remaining 95% — see 0010_platform_fee.sql. */
export const PLATFORM_FEE_RATE = 0.05;

export type OrderItem = {
	id: string;
	orderId: string;
	farmerId: string;
	productId: string | null;
	productName: string;
	productImage: string | null;
	unitPrice: number;
	unit: string;
	quantity: number;
	status: OrderItemStatus;
	payoutStatus: PayoutStatus;
	payoutReference: string | null;
	paidOutAt: string | null;
	platformFeeAmount: number | null;
	payoutAmount: number | null;
};

export type Order = {
	id: string;
	buyerId: string;
	totalAmount: number;
	deliveryState: string;
	deliveryCity: string | null;
	deliveryAddress: string;
	deliveryLandmark: string | null;
	paymentReference: string | null;
	paymentStatus: PaymentStatus;
	createdAt: string;
	items: OrderItem[];
};

type OrderItemRow = {
	id: string;
	order_id: string;
	farmer_id: string;
	product_id: string | null;
	product_name: string;
	product_image: string | null;
	unit_price: number | string;
	unit: string;
	quantity: number;
	status: OrderItemStatus;
	payout_status: PayoutStatus;
	payout_reference: string | null;
	paid_out_at: string | null;
	platform_fee_amount: number | string | null;
	payout_amount: number | string | null;
};

type OrderRow = {
	id: string;
	buyer_id: string;
	total_amount: number | string;
	delivery_state: string;
	delivery_city: string | null;
	delivery_address: string;
	delivery_landmark: string | null;
	payment_reference: string | null;
	payment_status: PaymentStatus;
	created_at: string;
	order_items: OrderItemRow[];
};

function mapOrderItemRow(item: OrderItemRow): OrderItem {
	return {
		id: item.id,
		orderId: item.order_id,
		farmerId: item.farmer_id,
		productId: item.product_id,
		productName: item.product_name,
		productImage: item.product_image,
		unitPrice: Number(item.unit_price),
		unit: item.unit,
		quantity: item.quantity,
		status: item.status,
		payoutStatus: item.payout_status,
		payoutReference: item.payout_reference,
		paidOutAt: item.paid_out_at,
		platformFeeAmount:
			item.platform_fee_amount === null ? null : Number(item.platform_fee_amount),
		payoutAmount: item.payout_amount === null ? null : Number(item.payout_amount),
	};
}

function mapOrderRow(row: OrderRow): Order {
	return {
		id: row.id,
		buyerId: row.buyer_id,
		totalAmount: Number(row.total_amount),
		deliveryState: row.delivery_state,
		deliveryCity: row.delivery_city,
		deliveryAddress: row.delivery_address,
		deliveryLandmark: row.delivery_landmark,
		paymentReference: row.payment_reference,
		paymentStatus: row.payment_status,
		createdAt: row.created_at,
		items: (row.order_items ?? []).map(mapOrderItemRow),
	};
}

/** Admin-only: every order platform-wide, most recent first. RLS grants
 * admins SELECT on orders/order_items (see 0007_admin.sql). */
export async function getAllOrders(supabase: SupabaseClient, limit = 100): Promise<Order[]> {
	const { data, error } = await supabase
		.from("orders")
		.select("*, order_items(*)")
		.order("created_at", { ascending: false })
		.limit(limit);

	if (error || !data) return [];
	return (data as unknown as OrderRow[]).map(mapOrderRow);
}

export async function getOrderById(
	supabase: SupabaseClient,
	id: string
): Promise<Order | null> {
	const { data } = await supabase
		.from("orders")
		.select("*, order_items(*)")
		.eq("id", id)
		.maybeSingle();

	return data ? mapOrderRow(data as unknown as OrderRow) : null;
}

export async function getBuyerOrders(
	supabase: SupabaseClient,
	buyerId: string
): Promise<Order[]> {
	const { data, error } = await supabase
		.from("orders")
		.select("*, order_items(*)")
		.eq("buyer_id", buyerId)
		.order("created_at", { ascending: false });

	if (error || !data) return [];
	return (data as unknown as OrderRow[]).map(mapOrderRow);
}

export type FarmerOrderItem = OrderItem & {
	order: Pick<Order, "id" | "createdAt" | "deliveryState" | "deliveryAddress" | "paymentStatus">;
};

type FarmerOrderItemRow = OrderItemRow & {
	orders: {
		id: string;
		created_at: string;
		delivery_state: string;
		delivery_address: string;
		payment_status: PaymentStatus;
	};
};

function mapFarmerOrderItemRow(row: FarmerOrderItemRow): FarmerOrderItem {
	return {
		...mapOrderItemRow(row),
		order: {
			id: row.orders.id,
			createdAt: row.orders.created_at,
			deliveryState: row.orders.delivery_state,
			deliveryAddress: row.orders.delivery_address,
			paymentStatus: row.orders.payment_status,
		},
	};
}

/** A farmer's incoming order items. Only items from *paid* orders are
 * included — an unpaid order isn't something a farmer should act on yet. */
export async function getFarmerOrderItems(
	supabase: SupabaseClient,
	farmerId: string
): Promise<FarmerOrderItem[]> {
	const { data, error } = await supabase
		.from("order_items")
		.select("*, orders!inner(id, created_at, delivery_state, delivery_address, payment_status)")
		.eq("farmer_id", farmerId)
		.eq("orders.payment_status", "paid")
		.order("created_at", { ascending: false });

	if (error || !data) return [];
	return (data as unknown as FarmerOrderItemRow[]).map(mapFarmerOrderItemRow);
}

export async function getFarmerOrderItemById(
	supabase: SupabaseClient,
	id: string
): Promise<FarmerOrderItem | null> {
	const { data } = await supabase
		.from("order_items")
		.select("*, orders!inner(id, created_at, delivery_state, delivery_address, payment_status)")
		.eq("id", id)
		.maybeSingle();

	return data ? mapFarmerOrderItemRow(data as unknown as FarmerOrderItemRow) : null;
}

export type EarningsSummary = {
	/** Net of AgriMarket's platform fee — what actually lands (or will
	 * land) in the farmer's bank account. */
	completedTotal: number;
	pendingTotal: number;
	orderItemCount: number;
};

/** A farmer's earnings snapshot, net of AgriMarket's platform fee.
 * "Completed" means the buyer confirmed delivery, which is also the
 * moment the automatic Paystack transfer fires — completedTotal reflects
 * the recorded payout_amount for those items. Pending items haven't been
 * finalized yet, so their share is estimated at the same fee rate. */
export function summarizeFarmerEarnings(items: FarmerOrderItem[]): EarningsSummary {
	let completedTotal = 0;
	let pendingTotal = 0;

	for (const item of items) {
		const lineTotal = item.unitPrice * item.quantity;
		if (item.status === "completed") {
			completedTotal += item.payoutAmount ?? lineTotal * (1 - PLATFORM_FEE_RATE);
		} else if (item.status !== "cancelled") {
			pendingTotal += lineTotal * (1 - PLATFORM_FEE_RATE);
		}
	}

	return { completedTotal, pendingTotal, orderItemCount: items.length };
}
