"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { checkoutSchema } from "@/lib/validations/checkout";
import { initializePaystackTransaction } from "@/lib/paystack";
import { pageRoutes } from "@/lib/routes";
import { flattenZodErrors, type FieldErrors } from "@/lib/validations/auth";

export type CheckoutState = {
	error: string | null;
	fieldErrors?: FieldErrors;
};

function siteUrl() {
	return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

type CartItemInput = { productId: string; quantity: number };

export async function initiateCheckout(
	_prevState: CheckoutState,
	formData: FormData
): Promise<CheckoutState> {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user || !user.email) {
		return { error: "You must be logged in to check out." };
	}

	const parsed = checkoutSchema.safeParse({
		deliveryState: formData.get("deliveryState"),
		deliveryCity: formData.get("deliveryCity") ?? "",
		deliveryAddress: formData.get("deliveryAddress"),
		deliveryLandmark: formData.get("deliveryLandmark") ?? "",
	});

	if (!parsed.success) {
		return { error: "Please fix the errors below", fieldErrors: flattenZodErrors(parsed.error) };
	}

	let cartItems: CartItemInput[];
	try {
		cartItems = JSON.parse(String(formData.get("cartItems") ?? "[]"));
	} catch {
		return { error: "Your cart data is invalid. Please refresh and try again." };
	}

	if (!Array.isArray(cartItems) || cartItems.length === 0) {
		return { error: "Your cart is empty." };
	}

	// Re-fetch authoritative product data server-side — the client only ever
	// tells us *which* products and *how many*; price, farmer, name, and
	// image always come fresh from the database, never from the form.
	const productIds = cartItems.map((item) => item.productId);
	const { data: products, error: productsError } = await supabase
		.from("products")
		.select("id, name, price, unit, images, farmer_id, is_active")
		.in("id", productIds);

	if (productsError || !products || products.length === 0) {
		return { error: "Couldn't verify your cart items. Please try again." };
	}

	const productMap = new Map(products.map((p) => [p.id as string, p]));

	const orderItemsToInsert: {
		buyer_id: string;
		farmer_id: string;
		product_id: string;
		product_name: string;
		product_image: string | null;
		unit_price: number;
		unit: string;
		quantity: number;
	}[] = [];

	let totalAmount = 0;

	for (const cartItem of cartItems) {
		const product = productMap.get(cartItem.productId);
		if (!product || !product.is_active) continue;

		const quantity = Math.max(1, Math.floor(Number(cartItem.quantity) || 1));
		const images = Array.isArray(product.images) ? (product.images as string[]) : [];
		const price = Number(product.price);

		orderItemsToInsert.push({
			buyer_id: user.id,
			farmer_id: product.farmer_id as string,
			product_id: product.id as string,
			product_name: product.name as string,
			product_image: images[0] ?? null,
			unit_price: price,
			unit: product.unit as string,
			quantity,
		});

		totalAmount += price * quantity;
	}

	if (orderItemsToInsert.length === 0) {
		return { error: "None of the items in your cart are currently available." };
	}

	const { deliveryState, deliveryCity, deliveryAddress, deliveryLandmark } = parsed.data;

	const { data: order, error: orderError } = await supabase
		.from("orders")
		.insert({
			buyer_id: user.id,
			total_amount: totalAmount,
			delivery_state: deliveryState,
			delivery_city: deliveryCity || null,
			delivery_address: deliveryAddress,
			delivery_landmark: deliveryLandmark || null,
		})
		.select()
		.single();

	if (orderError || !order) {
		return { error: orderError?.message ?? "Couldn't create your order. Please try again." };
	}

	const { error: itemsError } = await supabase
		.from("order_items")
		.insert(orderItemsToInsert.map((item) => ({ ...item, order_id: order.id })));

	if (itemsError) {
		await supabase.from("orders").delete().eq("id", order.id);
		return { error: "Couldn't save your order items. Please try again." };
	}

	const reference = `agrimarket-${order.id}`;
	let authorizationUrl: string;

	try {
		const result = await initializePaystackTransaction({
			email: user.email,
			amountNaira: totalAmount,
			reference,
			callbackUrl: `${siteUrl()}${pageRoutes.checkoutCallback}?order_id=${order.id}`,
			metadata: { order_id: order.id, buyer_id: user.id },
		});
		authorizationUrl = result.authorizationUrl;

		await supabase.from("orders").update({ payment_reference: reference }).eq("id", order.id);
	} catch (err) {
		await supabase.from("orders").delete().eq("id", order.id);
		return {
			error:
				err instanceof Error
					? `Payment initialization failed: ${err.message}`
					: "Payment initialization failed. Please try again.",
		};
	}

	redirect(authorizationUrl);
}
