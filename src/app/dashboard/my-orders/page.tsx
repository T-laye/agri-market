import { redirect } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getFarmerProfile } from "@/lib/data/farmer";
import { getBuyerOrders } from "@/lib/data/orders";
import { pageRoutes } from "@/lib/routes";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import OrderItemStatusBadge from "@/components/dashboard/OrderItemStatusBadge";
import ConfirmDeliveryButton from "@/components/dashboard/ConfirmDeliveryButton";
import Button from "@/components/ui/Button";

export const metadata: Metadata = {
	title: "My Orders | AgriMarket Nigeria",
};

function formatNaira(amount: number) {
	return new Intl.NumberFormat("en-NG", {
		style: "currency",
		currency: "NGN",
		maximumFractionDigits: 0,
	}).format(amount);
}

export default async function MyOrdersPage() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect(`${pageRoutes.auth.login}?redirect=${pageRoutes.dashboard.myOrders}`);
	}

	const isFarmer = Boolean(user.user_metadata?.is_farmer);
	const farmerProfile = isFarmer ? await getFarmerProfile(supabase, user.id) : null;
	const orders = await getBuyerOrders(supabase, user.id);

	return (
		<DashboardLayout isFarmer={isFarmer} kycStatus={farmerProfile?.kyc_status} wide>
			<div className="flex flex-col gap-6">
				<div>
					<h2 className="font-bold text-lg text-neutral-500">My Orders</h2>
					<p className="text-sm text-neutral-400">
						{orders.length} {orders.length === 1 ? "order" : "orders"} placed
					</p>
				</div>

				{orders.length === 0 ? (
					<div className="flex flex-col items-center justify-center gap-3 py-20 text-center border border-dashed border-neutral-200 rounded-[15px]">
						<p className="text-neutral-500 font-semibold">No orders yet</p>
						<p className="text-sm text-neutral-400 max-w-xs">
							Browse the marketplace to place your first order.
						</p>
						<Button href={pageRoutes.marketplace} variant="primary" className="mt-2">
							Browse Marketplace
						</Button>
					</div>
				) : (
					<div className="flex flex-col gap-5">
						{orders.map((order) => (
							<div
								key={order.id}
								className="border border-neutral-200 rounded-[15px] overflow-hidden"
							>
								<div className="flex items-center justify-between flex-wrap gap-2 bg-neutral-100/60 px-4 sm:px-5 py-3">
									<div className="flex items-center gap-3 flex-wrap">
										<span className="text-xs text-neutral-400">
											Order #{order.id.slice(0, 8)}
										</span>
										<span className="text-xs text-neutral-400">
											{new Date(order.createdAt).toLocaleDateString("en-NG", {
												day: "numeric",
												month: "short",
												year: "numeric",
											})}
										</span>
									</div>
									<span
										className={`text-[10px] font-bold px-2.5 py-1 rounded-[30px] ${
											order.paymentStatus === "paid"
												? "bg-secondary-100 text-secondary-700"
												: order.paymentStatus === "failed"
													? "bg-red-100 text-red-600"
													: "bg-neutral-100 text-neutral-400"
										}`}
									>
										{order.paymentStatus === "paid"
											? "Payment Confirmed"
											: order.paymentStatus === "failed"
												? "Payment Failed"
												: "Payment Pending"}
									</span>
								</div>

								<div className="flex flex-col divide-y divide-neutral-100 px-4 sm:px-5">
									{order.items.map((item) => (
										<div
											key={item.id}
											className="flex flex-col sm:flex-row sm:items-center gap-3 py-4"
										>
											<div className="flex items-center gap-3 flex-1 min-w-0">
												{item.productImage && (
													<div className="relative w-12 h-12 rounded-[10px] overflow-hidden shrink-0 bg-neutral-100">
														<Image
															src={item.productImage}
															alt={item.productName}
															fill
															sizes="48px"
															className="object-cover"
															unoptimized
														/>
													</div>
												)}
												<div className="min-w-0">
													<p className="text-sm font-semibold text-neutral-500 truncate">
														{item.productName}
													</p>
													<p className="text-xs text-neutral-400">
														{item.quantity} × {formatNaira(item.unitPrice)}
													</p>
												</div>
											</div>

											<div className="flex items-center justify-between sm:justify-end gap-3 pl-15 sm:pl-0">
												<OrderItemStatusBadge status={item.status} />
												{item.status === "delivered" && (
													<ConfirmDeliveryButton itemId={item.id} />
												)}
											</div>
										</div>
									))}
								</div>

								<div className="flex items-center justify-between px-4 sm:px-5 py-3 border-t border-neutral-100">
									<span className="text-sm text-neutral-400">Total</span>
									<span className="font-bold text-primary text-sm">
										{formatNaira(order.totalAmount)}
									</span>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</DashboardLayout>
	);
}
