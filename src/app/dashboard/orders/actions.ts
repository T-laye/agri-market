"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { pageRoutes } from "@/lib/routes";
import { FARMER_STATUS_SEQUENCE, PLATFORM_FEE_RATE, type OrderItemStatus } from "@/lib/data/orders";
import { initiateTransfer } from "@/lib/paystack";

export type OrderActionResult = { error: string | null };

/** Farmer action: moves an item to the next step in the fulfillment
 * sequence (pending -> accepted -> preparing -> in_transit -> delivered). */
export async function advanceOrderItem(itemId: string): Promise<OrderActionResult> {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return { error: "You must be logged in to do this." };
	}

	const { data: item, error: fetchError } = await supabase
		.from("order_items")
		.select("status, farmer_id")
		.eq("id", itemId)
		.maybeSingle();

	if (fetchError || !item || item.farmer_id !== user.id) {
		return { error: "Order item not found." };
	}

	const currentIndex = FARMER_STATUS_SEQUENCE.indexOf(item.status as OrderItemStatus);
	const nextStatus = FARMER_STATUS_SEQUENCE[currentIndex + 1];

	if (currentIndex === -1 || !nextStatus) {
		return { error: "This order can't be advanced any further." };
	}

	const { error } = await supabase
		.from("order_items")
		.update({ status: nextStatus })
		.eq("id", itemId)
		.eq("farmer_id", user.id);

	if (error) {
		return { error: error.message };
	}

	revalidatePath(pageRoutes.dashboard.orders);
	revalidatePath(pageRoutes.dashboard.earnings);
	return { error: null };
}

/** Farmer action: cancel an item that hasn't shipped yet (e.g. out of stock). */
export async function cancelOrderItem(itemId: string): Promise<OrderActionResult> {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return { error: "You must be logged in to do this." };
	}

	const { data: item, error: fetchError } = await supabase
		.from("order_items")
		.select("status, farmer_id")
		.eq("id", itemId)
		.maybeSingle();

	if (fetchError || !item || item.farmer_id !== user.id) {
		return { error: "Order item not found." };
	}

	if (item.status === "delivered" || item.status === "completed") {
		return { error: "This order has already been delivered and can't be cancelled." };
	}

	const { error } = await supabase
		.from("order_items")
		.update({ status: "cancelled" })
		.eq("id", itemId)
		.eq("farmer_id", user.id);

	if (error) {
		return { error: error.message };
	}

	revalidatePath(pageRoutes.dashboard.orders);
	return { error: null };
}

/** Buyer action: confirms a delivered item was received. This is the
 * escrow release trigger — it marks the item completed and, if the farmer
 * has a payout account on file, immediately transfers their earnings for
 * this line item via Paystack. */
export async function confirmOrderItemDelivery(itemId: string): Promise<OrderActionResult> {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return { error: "You must be logged in to do this." };
	}

	const { data: item, error: fetchError } = await supabase
		.from("order_items")
		.select("status, buyer_id, farmer_id, unit_price, quantity")
		.eq("id", itemId)
		.maybeSingle();

	if (fetchError || !item || item.buyer_id !== user.id) {
		return { error: "Order item not found." };
	}

	if (item.status !== "delivered") {
		return { error: "This item hasn't been marked as delivered yet." };
	}

	// Buyers have no RLS access to farmer_profiles, so this goes through a
	// SECURITY DEFINER function that exposes only the recipient code.
	const { data: recipientCode } = await supabase.rpc("get_farmer_recipient_code", {
		p_farmer_id: item.farmer_id,
	});

	const grossAmount = Number(item.unit_price) * item.quantity;
	const platformFeeAmount = Math.round(grossAmount * PLATFORM_FEE_RATE * 100) / 100;
	const payoutAmount = Math.round((grossAmount - platformFeeAmount) * 100) / 100;

	const updates: {
		status: OrderItemStatus;
		payout_status: "pending" | "processing" | "paid" | "failed";
		payout_reference?: string;
		paid_out_at?: string;
		platform_fee_amount: number;
		payout_amount: number;
	} = {
		status: "completed",
		payout_status: "pending",
		platform_fee_amount: platformFeeAmount,
		payout_amount: payoutAmount,
	};

	if (recipientCode) {
		const reference = `payout-${itemId}-${Date.now()}`;
		try {
			const transfer = await initiateTransfer({
				recipientCode,
				amountNaira: payoutAmount,
				reference,
				reason: "AgriMarket order payout",
			});

			updates.payout_reference = reference;
			if (transfer.status === "success") {
				updates.payout_status = "paid";
				updates.paid_out_at = new Date().toISOString();
			} else {
				updates.payout_status = "processing";
			}
		} catch {
			updates.payout_status = "failed";
		}
	}

	const { error } = await supabase
		.from("order_items")
		.update(updates)
		.eq("id", itemId)
		.eq("buyer_id", user.id);

	if (error) {
		return { error: error.message };
	}

	revalidatePath(pageRoutes.dashboard.myOrders);
	revalidatePath(pageRoutes.dashboard.earnings);
	revalidatePath(pageRoutes.dashboard.orders);
	return { error: null };
}
