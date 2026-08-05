import { redirect, notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { HiOutlineCheckCircle, HiOutlineExclamationCircle } from "react-icons/hi";
import { createClient } from "@/lib/supabase/server";
import { getOrderById } from "@/lib/data/orders";
import { pageRoutes } from "@/lib/routes";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Button from "@/components/ui/Button";
import ClearCartOnMount from "@/components/checkout/ClearCartOnMount";

export const metadata: Metadata = {
	title: "Order Confirmed | AgriMarket Nigeria",
};

function formatNaira(amount: number) {
	return new Intl.NumberFormat("en-NG", {
		style: "currency",
		currency: "NGN",
		maximumFractionDigits: 0,
	}).format(amount);
}

export default async function CheckoutSuccessPage({
	searchParams,
}: {
	searchParams: Promise<{ order_id?: string }>;
}) {
	const { order_id } = await searchParams;
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect(pageRoutes.auth.login);
	}

	if (!order_id) {
		redirect(pageRoutes.marketplace);
	}

	const order = await getOrderById(supabase, order_id);
	if (!order || order.buyerId !== user.id) {
		notFound();
	}

	const paid = order.paymentStatus === "paid";

	return (
		<>
			<Header transparent={false} />
			<ClearCartOnMount paid={paid} />
			<main className="flex-1 pt-24 md:pt-28">
				<div className="custom-container py-10 md:py-14">
					<div className="max-w-2xl mx-auto flex flex-col gap-8">
						<div className="flex flex-col items-center text-center gap-3">
							{paid ? (
								<>
									<span className="w-16 h-16 flex items-center justify-center rounded-full bg-secondary-100 text-secondary-600 text-3xl">
										<HiOutlineCheckCircle />
									</span>
									<h1 className="h3 text-neutral-500">Order Confirmed!</h1>
									<p className="p1 text-neutral-400 max-w-md">
										Your payment is held securely in escrow and will be
										released to the farmer once you confirm delivery.
									</p>
								</>
							) : (
								<>
									<span className="w-16 h-16 flex items-center justify-center rounded-full bg-red-100 text-red-500 text-3xl">
										<HiOutlineExclamationCircle />
									</span>
									<h1 className="h3 text-neutral-500">Payment Not Confirmed</h1>
									<p className="p1 text-neutral-400 max-w-md">
										We couldn&apos;t confirm payment for this order yet. If
										you completed payment, this may just need a moment —
										otherwise please try checking out again.
									</p>
								</>
							)}
						</div>

						<div className="border border-neutral-200 rounded-[15px] p-5 md:p-6 flex flex-col gap-5">
							<div className="flex items-center justify-between flex-wrap gap-2">
								<span className="text-sm text-neutral-400">
									Order #{order.id.slice(0, 8)}
								</span>
								<span className="text-sm text-neutral-400">
									{new Date(order.createdAt).toLocaleDateString("en-NG", {
										day: "numeric",
										month: "long",
										year: "numeric",
									})}
								</span>
							</div>

							<div className="flex flex-col gap-4 divide-y divide-neutral-100">
								{order.items.map((item) => (
									<div key={item.id} className="flex gap-3 pt-4 first:pt-0">
										{item.productImage && (
											<div className="relative w-14 h-14 rounded-[10px] overflow-hidden shrink-0 bg-neutral-100">
												<Image
													src={item.productImage}
													alt={item.productName}
													fill
													sizes="56px"
													className="object-cover"
													unoptimized
												/>
											</div>
										)}
										<div className="flex-1 min-w-0">
											<p className="text-sm font-semibold text-neutral-500 truncate">
												{item.productName}
											</p>
											<p className="text-xs text-neutral-400">
												{item.quantity} × {formatNaira(item.unitPrice)}
											</p>
										</div>
										<span className="text-sm font-semibold text-neutral-500 shrink-0">
											{formatNaira(item.unitPrice * item.quantity)}
										</span>
									</div>
								))}
							</div>

							<div className="flex items-center justify-between border-t border-neutral-200 pt-4">
								<span className="text-sm text-neutral-400">Total Paid</span>
								<span className="font-bold text-primary text-lg">
									{formatNaira(order.totalAmount)}
								</span>
							</div>

							<div className="text-sm text-neutral-400">
								<p className="font-medium text-neutral-500 mb-1">
									Delivering to
								</p>
								<p>
									{order.deliveryAddress}
									{order.deliveryLandmark ? `, ${order.deliveryLandmark}` : ""}
								</p>
								<p>
									{order.deliveryCity ? `${order.deliveryCity}, ` : ""}
									{order.deliveryState} State
								</p>
							</div>
						</div>

						<div className="flex justify-center">
							<Button href={pageRoutes.marketplace} variant="primary">
								Continue Shopping
							</Button>
						</div>
					</div>
				</div>
			</main>
			<Footer />
		</>
	);
}
