import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAllFarmersForAdmin } from "@/lib/data/admin";
import { pageRoutes } from "@/lib/routes";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminAvatar from "@/components/admin/AdminAvatar";
import VerificationBadge from "@/components/dashboard/VerificationBadge";

export const metadata: Metadata = {
	title: "Farmers | Admin | AgriMarket Nigeria",
};

function formatNaira(amount: number) {
	return new Intl.NumberFormat("en-NG", {
		style: "currency",
		currency: "NGN",
		maximumFractionDigits: 0,
	}).format(amount);
}

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

	let adminClient;
	try {
		adminClient = createAdminClient();
	} catch {
		adminClient = undefined;
	}
	const farmers = await getAllFarmersForAdmin(supabase, adminClient);

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
								className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 duration-150 hover:bg-neutral-100/60"
							>
								<AdminAvatar avatarUrl={farmer.avatarUrl} name={farmer.name || farmer.farm_name} />

								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2 flex-wrap">
										<p className="font-semibold text-sm text-neutral-500 truncate">
											{farmer.farm_name}
										</p>
										{farmer.provider === "google" && (
											<span className="rounded-[30px] bg-blue-50 text-blue-600 text-[10px] font-semibold px-2.5 py-1">
												Google
											</span>
										)}
									</div>
									<p className="text-xs text-neutral-400 truncate">
										{farmer.name ?? "No name on file"}
										{farmer.email && <> · {farmer.email}</>}
									</p>
									<p className="text-xs text-neutral-400 mt-0.5">
										{farmer.state} State · {farmer.phone}
										{farmer.productCount > 0 && (
											<>
												{" "}
												· {farmer.productCount} product{farmer.productCount === 1 ? "" : "s"} ·{" "}
												{formatNaira(farmer.totalSales)} in sales
											</>
										)}
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
