import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyPaystackTransaction } from "@/lib/paystack";
import { pageRoutes } from "@/lib/routes";

export async function GET(request: Request) {
	const { searchParams, origin } = new URL(request.url);
	const reference = searchParams.get("reference") ?? searchParams.get("trxref");
	const orderId = searchParams.get("order_id");

	if (!reference || !orderId) {
		return NextResponse.redirect(`${origin}${pageRoutes.checkout}?error=missing-reference`);
	}

	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return NextResponse.redirect(`${origin}${pageRoutes.auth.login}`);
	}

	try {
		const result = await verifyPaystackTransaction(reference);

		if (result.status === "success") {
			await supabase
				.from("orders")
				.update({ payment_status: "paid" })
				.eq("id", orderId)
				.eq("buyer_id", user.id);

			return NextResponse.redirect(
				`${origin}${pageRoutes.orderConfirmation}?order_id=${orderId}`
			);
		}

		await supabase
			.from("orders")
			.update({ payment_status: "failed" })
			.eq("id", orderId)
			.eq("buyer_id", user.id);

		return NextResponse.redirect(`${origin}${pageRoutes.checkout}?error=payment-failed`);
	} catch {
		return NextResponse.redirect(`${origin}${pageRoutes.checkout}?error=verification-failed`);
	}
}
