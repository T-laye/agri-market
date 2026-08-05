"use client";

import { useActionState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { initiateCheckout, type CheckoutState } from "@/app/checkout/actions";
import { useCartStore, selectTotalPrice } from "@/store/cart";
import { locations } from "@/lib/data/products";
import { pageRoutes } from "@/lib/routes";
import Button from "@/components/ui/Button";

const initialState: CheckoutState = { error: null };

function formatNaira(amount: number) {
	return new Intl.NumberFormat("en-NG", {
		style: "currency",
		currency: "NGN",
		maximumFractionDigits: 0,
	}).format(amount);
}

export default function CheckoutForm({
	initialState: initialDeliveryState,
	initialCity,
	initialAddress,
	initialLandmark,
}: {
	initialState: string;
	initialCity: string;
	initialAddress: string;
	initialLandmark: string;
}) {
	const [state, formAction, pending] = useActionState(initiateCheckout, initialState);
	const items = useCartStore((s) => s.items);
	const totalPrice = useCartStore(selectTotalPrice);

	const cartItemsJson = useMemo(
		() =>
			JSON.stringify(
				items.map((item) => ({ productId: item.productId, quantity: item.quantity }))
			),
		[items]
	);

	if (items.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center gap-3 py-24 text-center border border-dashed border-neutral-200 rounded-[15px]">
				<p className="text-neutral-500 font-semibold">Your cart is empty</p>
				<p className="text-sm text-neutral-400">Add some produce before checking out.</p>
				<Button href={pageRoutes.marketplace} variant="primary" className="mt-2">
					Browse Marketplace
				</Button>
			</div>
		);
	}

	return (
		<form action={formAction} className="flex flex-col lg:flex-row gap-8">
			<input type="hidden" name="cartItems" value={cartItemsJson} />

			<div className="flex-1 flex flex-col gap-6 order-2 lg:order-1">
				<div className="flex flex-col gap-1.5">
					<label htmlFor="deliveryState" className="text-sm font-medium text-neutral-500">
						Delivery state
					</label>
					<select
						id="deliveryState"
						name="deliveryState"
						defaultValue={initialDeliveryState}
						className="select-class"
					>
						<option value="" disabled>
							Select your state
						</option>
						{locations.map((loc) => (
							<option key={loc} value={loc}>
								{loc} State
							</option>
						))}
					</select>
					{state.fieldErrors?.deliveryState && (
						<span className="text-xs text-red-600">{state.fieldErrors.deliveryState}</span>
					)}
				</div>

				<div className="flex flex-col gap-1.5">
					<label htmlFor="deliveryCity" className="text-sm font-medium text-neutral-500">
						City / Town
					</label>
					<input
						id="deliveryCity"
						name="deliveryCity"
						type="text"
						defaultValue={initialCity}
						placeholder="Ikeja"
						className="input-class"
					/>
				</div>

				<div className="flex flex-col gap-1.5">
					<label htmlFor="deliveryAddress" className="text-sm font-medium text-neutral-500">
						Delivery address
					</label>
					<input
						id="deliveryAddress"
						name="deliveryAddress"
						type="text"
						defaultValue={initialAddress}
						placeholder="12 Allen Avenue"
						className="input-class"
					/>
					{state.fieldErrors?.deliveryAddress && (
						<span className="text-xs text-red-600">{state.fieldErrors.deliveryAddress}</span>
					)}
				</div>

				<div className="flex flex-col gap-1.5">
					<label htmlFor="deliveryLandmark" className="text-sm font-medium text-neutral-500">
						Landmark <span className="text-neutral-400 font-normal">(optional)</span>
					</label>
					<input
						id="deliveryLandmark"
						name="deliveryLandmark"
						type="text"
						defaultValue={initialLandmark}
						placeholder="Near First Bank"
						className="input-class"
					/>
				</div>

				{state.error && (
					<p className="text-sm text-red-600">{state.error}</p>
				)}
			</div>

			<div className="w-full lg:w-96 shrink-0 order-1 lg:order-2">
				<div className="flex flex-col gap-4 border border-neutral-200 rounded-[15px] p-5 sticky top-28">
					<h2 className="font-bold text-neutral-500">Order Summary</h2>

					<div className="flex flex-col gap-4 max-h-80 overflow-y-auto">
						{items.map((item) => (
							<div key={item.productId} className="flex gap-3">
								<div className="relative w-14 h-14 rounded-[10px] overflow-hidden shrink-0 bg-neutral-100">
									<Image
										src={item.image}
										alt={item.name}
										fill
										sizes="56px"
										className="object-cover"
										unoptimized
									/>
								</div>
								<div className="flex-1 min-w-0">
									<p className="text-sm font-semibold text-neutral-500 truncate">
										{item.name}
									</p>
									<p className="text-xs text-neutral-400">
										{item.quantity} × {formatNaira(item.price)}
									</p>
								</div>
								<span className="text-sm font-semibold text-neutral-500 shrink-0">
									{formatNaira(item.price * item.quantity)}
								</span>
							</div>
						))}
					</div>

					<div className="flex items-center justify-between border-t border-neutral-200 pt-4">
						<span className="text-sm text-neutral-400">Total</span>
						<span className="font-bold text-primary text-lg">
							{formatNaira(totalPrice)}
						</span>
					</div>

					<Button variant="primary" className="w-full" disabled={pending}>
						{pending ? "Redirecting to Paystack…" : `Pay ${formatNaira(totalPrice)}`}
					</Button>

					<Link
						href={pageRoutes.marketplace}
						className="text-xs text-center text-neutral-400 hover:text-primary duration-150"
					>
						Continue shopping
					</Link>
				</div>
			</div>
		</form>
	);
}
