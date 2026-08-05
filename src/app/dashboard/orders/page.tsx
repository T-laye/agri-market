import { redirect } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getFarmerProfile } from "@/lib/data/farmer";
import { getFarmerOrderItems } from "@/lib/data/orders";
import { pageRoutes } from "@/lib/routes";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import OrderItemStatusBadge from "@/components/dashboard/OrderItemStatusBadge";
import FarmerOrderItemActions from "@/components/dashboard/FarmerOrderItemActions";

export const metadata: Metadata = {
	title: "Orders | AgriMarket Nigeria",
};

function formatNaira(amount: number) {
	return new Intl.NumberFormat("en-NG", {
		style: "currency",
		currency: "NGN",
		maximumFractionDigits: 0,
	}).format(amount);
}

export default async function FarmerOrdersPage() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect(`${pageRoutes.auth.login}?redirect=${pageRoutes.dashboard.orders}`);
	}

	if (!user.user_metadata?.is_farmer) {
		redirect(pageRoutes.becomeFarmer);
	}

	const profile = await getFarmerProfile(supabase, user.id);
	if (!profile) {
		redirect(pageRoutes.becomeFarmer);
	}

	const items = await getFarmerOrderItems(supabase, user.id);

	return (
		<DashboardLayout isFarmer kycStatus={profile.kyc_status} wide>
			<div className="flex flex-col gap-6">
				<div>
					<h2 className="font-bold text-lg text-neutral-500">Orders</h2>
					<p className="text-sm text-neutral-400">
						{items.length} {items.length === 1 ? "order item" : "order items"} to fulfill
					</p>
				</div>

				{items.length === 0 ? (
					<div className="flex flex-col items-center justify-center gap-3 py-20 text-center border border-dashed border-neutral-200 rounded-[15px]">
						<p className="text-neutral-500 font-semibold">No orders yet</p>
						<p className="text-sm text-neutral-400 max-w-xs">
							Paid orders for your products will show up here.
						</p>
					</div>
				) : (
					<div className="flex flex-col divide-y divide-neutral-200 border border-neutral-200 rounded-[15px] overflow-hidden">
						{items.map((item) => (
							<div
								key={item.id}
								className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4 p-4"
							>
								<div className="flex items-center gap-4 flex-1 min-w-0">
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
									<div className="min-w-0">
										<p className="font-semibold text-sm text-neutral-500 truncate">
											{item.productName}
										</p>
										<p className="text-xs text-neutral-400">
											{item.quantity} × {formatNaira(item.unitPrice)} · Order #
											{item.order.id.slice(0, 8)}
										</p>
										<p className="text-xs text-neutral-400 truncate">
											Deliver to: {item.order.deliveryAddress}, {item.order.deliveryState}{" "}
											State
										</p>
									</div>
								</div>

								<div className="flex items-center justify-between lg:justify-end gap-3 pl-18 lg:pl-0">
									<OrderItemStatusBadge status={item.status} />
									<FarmerOrderItemActions itemId={item.id} status={item.status} />
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</DashboardLayout>
	);
}
