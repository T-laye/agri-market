import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getFarmerProfile } from "@/lib/data/farmer";
import { getFarmerOrderItems } from "@/lib/data/orders";
import { pageRoutes } from "@/lib/routes";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import FarmerOrdersList from "@/components/dashboard/FarmerOrdersList";

export const metadata: Metadata = {
	title: "Orders | AgriMarket Nigeria",
};

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
						{items.length > 0 && " · click an order for full details"}
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
					<FarmerOrdersList items={items} />
				)}
			</div>
		</DashboardLayout>
	);
}
