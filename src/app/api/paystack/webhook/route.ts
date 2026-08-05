import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

/** Server-to-server confirmation from Paystack — a backup to the
 * redirect-based /checkout/callback flow. Covers the case where a buyer
 * pays but never makes it back to the browser tab (closed it, lost
 * connection, etc.). Also settles payout transfers once Paystack finishes
 * processing them asynchronously, which /dashboard/orders/actions.ts can't
 * know about at the moment it kicks the transfer off.
 *
 * Configure this URL in the Paystack Dashboard under Settings > API Keys
 * & Webhooks: https://<your-domain>/api/paystack/webhook */
export async function POST(request: Request) {
	const secret = process.env.PAYSTACK_SECRET_KEY;
	if (!secret) {
		return NextResponse.json({ error: "Not configured" }, { status: 500 });
	}

	const rawBody = await request.text();
	const signature = request.headers.get("x-paystack-signature");
	const expected = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");

	const signatureValid =
		typeof signature === "string" &&
		signature.length === expected.length &&
		crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));

	if (!signatureValid) {
		return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
	}

	let event: { event?: string; data?: Record<string, unknown> };
	try {
		event = JSON.parse(rawBody);
	} catch {
		return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
	}

	// Bypasses RLS deliberately — this request has no buyer/farmer session,
	// its authenticity comes from the signature check above instead.
	const supabase = createAdminClient();
	const data = event.data ?? {};
	const reference = typeof data.reference === "string" ? data.reference : null;

	switch (event.event) {
		case "charge.success": {
			if (reference && data.status === "success") {
				await supabase
					.from("orders")
					.update({ payment_status: "paid" })
					.eq("payment_reference", reference)
					.eq("payment_status", "pending"); // no-op if /checkout/callback already handled it
			}
			break;
		}
		case "transfer.success": {
			if (reference) {
				await supabase
					.from("order_items")
					.update({ payout_status: "paid", paid_out_at: new Date().toISOString() })
					.eq("payout_reference", reference);
			}
			break;
		}
		case "transfer.failed":
		case "transfer.reversed": {
			if (reference) {
				await supabase
					.from("order_items")
					.update({ payout_status: "failed" })
					.eq("payout_reference", reference);
			}
			break;
		}
		default:
			break;
	}

	return NextResponse.json({ received: true });
}
