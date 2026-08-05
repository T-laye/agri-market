import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getAllOrdersForAdmin } from "@/lib/data/admin";
import { pageRoutes } from "@/lib/routes";
import AdminLayout from "@/components/admin/AdminLayout";

export const metadata: Metadata = {
	title: "Orders | Admin | AgriMarket Nigeria",
};

function formatNaira(amount: number) {
	return new Intl.NumberFormat("en-NG", {
		style: "currency",
		currency: "NGN",
		maximumFractionDigits: 0,
	}).format(amount);
}

const PAYMENT_BADGE: Record<string, string> = {
	paid: "bg-secondary-100 text-secondary-700",
	pending: "bg-accent-500 text-accent-900",
	failed: "bg-red-100 text-red-600",
};

const PAYOUT_BADGE: Record<string, string> = {
	paid: "bg-secondary-100 text-secondary-700",
	processing: "bg-accent-500 text-accent-900",
	pending: "bg-neutral-100 text-neutral-400",
	failed: "bg-red-100 text-red-600",
	not_applicable: "bg-neutral-100 text-neutral-400",
};

const PAYOUT_LABEL: Record<string, string> = {
	paid: "Paid Out",
	processing: "Processing",
	pending: "Awaiting Payout",
	failed: "Payout Failed",
	not_applicable: "—",
};

export default async function AdminOrdersPage() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect(`${pageRoutes.auth.login}?redirect=${pageRoutes.admin.orders}`);
	}
	if (!user.user_metadata?.is_admin) {
		redirect(pageRoutes.home);
	}

	const orders = await getAllOrdersForAdmin(supabase);

	return (
		<AdminLayout>
			<div className="flex flex-col gap-6">
				<div>
					<h2 className="font-bold text-lg text-neutral-500">Orders</h2>
					<p className="text-sm text-neutral-400">
						Showing the {orders.length} most recent {orders.length === 1 ? "order" : "orders"}
					</p>
				</div>

				{orders.length === 0 ? (
					<div className="flex flex-col items-center justify-center gap-2 py-20 text-center border border-dashed border-neutral-200 rounded-[15px]">
						<p className="text-neutral-500 font-semibold">No orders yet</p>
					</div>
				) : (
					<div className="flex flex-col gap-4">
						{orders.map((order) => (
							<div
								key={order.id}
								className="border border-neutral-200 rounded-[15px] overflow-hidden"
							>
								<div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-100/60 px-4 py-3">
									<div>
										<p className="text-xs font-semibold text-neutral-500">
											Order #{order.id.slice(0, 8)}
										</p>
										<p className="text-xs text-neutral-400">
											{new Date(order.createdAt).toLocaleString("en-NG", {
												dateStyle: "medium",
												timeStyle: "short",
											})}{" "}
											· {order.deliveryState} State
										</p>
									</div>
									<div className="flex items-center gap-3">
										<span
											className={`rounded-[30px] px-3 py-1 text-xs font-semibold ${
												PAYMENT_BADGE[order.paymentStatus] ?? "bg-neutral-100 text-neutral-400"
											}`}
										>
											{order.paymentStatus === "paid"
												? "Payment Confirmed"
												: order.paymentStatus === "pending"
													? "Payment Pending"
													: "Payment Failed"}
										</span>
										<span className="font-bold text-sm text-neutral-500">
											{formatNaira(order.totalAmount)}
										</span>
									</div>
								</div>

								<div className="divide-y divide-neutral-100">
									{order.items.map((item) => (
										<div
											key={item.id}
											className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
										>
											<div className="min-w-0">
												<p className="text-sm font-medium text-neutral-500 truncate">
													{item.productName}
												</p>
												<p className="text-xs text-neutral-400">
													{item.quantity} {item.unit} ·{" "}
													{formatNaira(item.unitPrice * item.quantity)} gross
													{item.payoutAmount !== null && (
														<>
															{" "}
															· {formatNaira(item.payoutAmount)} to farmer (
															{formatNaira(item.platformFeeAmount ?? 0)} fee)
														</>
													)}
												</p>
											</div>
											<span
												className={`rounded-[30px] px-3 py-1 text-xs font-semibold shrink-0 ${
													PAYOUT_BADGE[item.payoutStatus]
												}`}
											>
												{PAYOUT_LABEL[item.payoutStatus]}
											</span>
										</div>
									))}
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</AdminLayout>
	);
}
