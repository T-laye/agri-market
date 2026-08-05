import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getAllFarmerProfiles } from "@/lib/data/admin";
import { pageRoutes } from "@/lib/routes";
import AdminLayout from "@/components/admin/AdminLayout";
import VerificationBadge from "@/components/dashboard/VerificationBadge";

export const metadata: Metadata = {
	title: "Farmers | Admin | AgriMarket Nigeria",
};

export default async function AdminFarmersPage() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect(`${pageRoutes.auth.login}?redirect=${pageRoutes.admin.farmers}`);
	}
	if (!user.user_metadata?.is_admin) {
		redirect(pageRoutes.home);
	}

	const farmers = await getAllFarmerProfiles(supabase);

	return (
		<AdminLayout>
			<div className="flex flex-col gap-6">
				<div>
					<h2 className="font-bold text-lg text-neutral-500">Farmers</h2>
					<p className="text-sm text-neutral-400">
						{farmers.length} registered {farmers.length === 1 ? "farmer" : "farmers"}
					</p>
				</div>

				{farmers.length === 0 ? (
					<div className="flex flex-col items-center justify-center gap-2 py-20 text-center border border-dashed border-neutral-200 rounded-[15px]">
						<p className="text-neutral-500 font-semibold">No farmers yet</p>
					</div>
				) : (
					<div className="flex flex-col divide-y divide-neutral-200 border border-neutral-200 rounded-[15px] overflow-hidden">
						{farmers.map((farmer) => (
							<Link
								key={farmer.id}
								href={`${pageRoutes.admin.farmers}/${farmer.id}`}
								className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-4 duration-150 hover:bg-neutral-100/60"
							>
								<div className="flex-1 min-w-0">
									<p className="font-semibold text-sm text-neutral-500 truncate">
										{farmer.farm_name}
									</p>
									<p className="text-xs text-neutral-400">
										{farmer.state} State · {farmer.phone}
									</p>
								</div>
								<VerificationBadge status={farmer.kyc_status} />
							</Link>
						))}
					</div>
				)}
			</div>
		</AdminLayout>
	);
}
