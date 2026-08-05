import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { HiOutlineCash, HiOutlineClock, HiOutlineInformationCircle } from "react-icons/hi";
import { createClient } from "@/lib/supabase/server";
import { getFarmerProfile } from "@/lib/data/farmer";
import { getFarmerOrderItems, summarizeFarmerEarnings } from "@/lib/data/orders";
import { pageRoutes } from "@/lib/routes";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

export const metadata: Metadata = {
	title: "Earnings | AgriMarket Nigeria",
};

function formatNaira(amount: number) {
	return new Intl.NumberFormat("en-NG", {
		style: "currency",
		currency: "NGN",
		maximumFractionDigits: 0,
	}).format(amount);
}

export default async function EarningsPage() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect(`${pageRoutes.auth.login}?redirect=${pageRoutes.dashboard.earnings}`);
	}

	if (!user.user_metadata?.is_farmer) {
		redirect(pageRoutes.becomeFarmer);
	}

	const profile = await getFarmerProfile(supabase, user.id);
	if (!profile) {
		redirect(pageRoutes.becomeFarmer);
	}

	const items = await getFarmerOrderItems(supabase, user.id);
	const summary = summarizeFarmerEarnings(items);

	return (
		<DashboardLayout isFarmer kycStatus={profile.kyc_status} wide>
			<div className="flex flex-col gap-6">
				<div>
					<h2 className="font-bold text-lg text-neutral-500">Earnings</h2>
					<p className="text-sm text-neutral-400">
						A snapshot of what you&apos;ve earned across {summary.orderItemCount}{" "}
						paid order {summary.orderItemCount === 1 ? "item" : "items"}.
					</p>
				</div>

				<div className="flex items-start gap-3 bg-accent-500 text-accent-900 rounded-[10px] p-4">
					<HiOutlineInformationCircle className="text-xl shrink-0 mt-0.5" />
					<p className="text-sm leading-6">
						Figures below are net of AgriMarket&apos;s 5% platform fee.
						&quot;Completed&quot; reflects buyer-confirmed deliveries — the moment your
						payout is automatically transferred to the bank account on file in{" "}
						<Link href={pageRoutes.dashboard.payoutSettings} className="font-semibold underline">
							Payout Settings
						</Link>
						.
					</p>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div className="flex items-center gap-4 border border-neutral-200 rounded-[15px] p-5">
						<span className="w-12 h-12 flex items-center justify-center rounded-full bg-primary-100 text-primary text-xl shrink-0">
							<HiOutlineCash />
						</span>
						<div>
							<p className="text-xs text-neutral-400">Completed Earnings</p>
							<p className="font-bold text-xl text-neutral-500">
								{formatNaira(summary.completedTotal)}
							</p>
						</div>
					</div>

					<div className="flex items-center gap-4 border border-neutral-200 rounded-[15px] p-5">
						<span className="w-12 h-12 flex items-center justify-center rounded-full bg-accent-500 text-accent-900 text-xl shrink-0">
							<HiOutlineClock />
						</span>
						<div>
							<p className="text-xs text-neutral-400">Pending (In Progress)</p>
							<p className="font-bold text-xl text-neutral-500">
								{formatNaira(summary.pendingTotal)}
							</p>
						</div>
					</div>
				</div>
			</div>
		</DashboardLayout>
	);
}
