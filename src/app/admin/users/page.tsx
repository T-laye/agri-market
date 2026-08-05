import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAllUsersForAdmin, type AdminUser } from "@/lib/data/admin";
import { pageRoutes } from "@/lib/routes";
import AdminLayout from "@/components/admin/AdminLayout";
import BanToggleButton from "@/components/admin/BanToggleButton";

export const metadata: Metadata = {
	title: "Users | Admin | AgriMarket Nigeria",
};

function formatNaira(amount: number) {
	return new Intl.NumberFormat("en-NG", {
		style: "currency",
		currency: "NGN",
		maximumFractionDigits: 0,
	}).format(amount);
}

function RoleBadges({ user }: { user: AdminUser }) {
	return (
		<div className="flex flex-wrap items-center gap-1.5">
			{user.isAdmin && (
				<span className="rounded-[30px] bg-primary-900 text-white text-[10px] font-semibold px-2.5 py-1">
					Admin
				</span>
			)}
			{user.isFarmer && (
				<span className="rounded-[30px] bg-secondary-100 text-secondary-700 text-[10px] font-semibold px-2.5 py-1">
					Farmer
				</span>
			)}
			{!user.isAdmin && !user.isFarmer && (
				<span className="rounded-[30px] bg-neutral-100 text-neutral-400 text-[10px] font-semibold px-2.5 py-1">
					Buyer
				</span>
			)}
			{user.bannedUntil && (
				<span className="rounded-[30px] bg-red-100 text-red-600 text-[10px] font-semibold px-2.5 py-1">
					Banned
				</span>
			)}
		</div>
	);
}

export default async function AdminUsersPage() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect(`${pageRoutes.auth.login}?redirect=${pageRoutes.admin.users}`);
	}
	if (!user.user_metadata?.is_admin) {
		redirect(pageRoutes.home);
	}

	let users: AdminUser[] = [];
	let setupError: string | null = null;
	try {
		users = await getAllUsersForAdmin(supabase, createAdminClient());
	} catch (err) {
		setupError = err instanceof Error ? err.message : "Couldn't load the user list.";
	}

	return (
		<AdminLayout>
			<div className="flex flex-col gap-6">
				<div>
					<h2 className="font-bold text-lg text-neutral-500">Users</h2>
					<p className="text-sm text-neutral-400">
						{setupError ? "Every registered account" : `${users.length} registered accounts`}
					</p>
				</div>

				{setupError ? (
					<div className="flex items-start gap-3 bg-accent-500 text-accent-900 rounded-[10px] p-4">
						<HiOutlineExclamationCircle className="text-xl shrink-0 mt-0.5" />
						<div className="text-sm leading-6">
							<p className="font-semibold">Service role key not configured</p>
							<p>
								Add <code className="font-mono text-xs bg-black/10 px-1 py-0.5 rounded">
									SUPABASE_SERVICE_ROLE_KEY
								</code>{" "}
								to your environment (Supabase Dashboard → Project Settings → API
								Keys → service_role) to list and manage all registered users.
							</p>
						</div>
					</div>
				) : users.length === 0 ? (
					<div className="flex flex-col items-center justify-center gap-2 py-20 text-center border border-dashed border-neutral-200 rounded-[15px]">
						<p className="text-neutral-500 font-semibold">No users yet</p>
					</div>
				) : (
					<div className="flex flex-col divide-y divide-neutral-200 border border-neutral-200 rounded-[15px] overflow-hidden">
						{users.map((u) => (
							<div
								key={u.id}
								className="flex flex-col sm:flex-row sm:items-center gap-3 p-4"
							>
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2 flex-wrap">
										<p className="font-semibold text-sm text-neutral-500 truncate">
											{u.email ?? "No email"}
										</p>
										<RoleBadges user={u} />
									</div>
									<p className="text-xs text-neutral-400 mt-0.5">
										Joined{" "}
										{new Date(u.createdAt).toLocaleDateString("en-NG", {
											dateStyle: "medium",
										})}
										{u.farmName && <> · {u.farmName}</>}
									</p>
									{(u.isFarmer || u.orderCount > 0) && (
										<p className="text-xs text-neutral-400 mt-0.5">
											{u.isFarmer && (
												<>
													{u.productCount} product{u.productCount === 1 ? "" : "s"} ·{" "}
													{formatNaira(u.totalSales)} in sales
												</>
											)}
											{u.isFarmer && u.orderCount > 0 && " · "}
											{u.orderCount > 0 && (
												<>
													{u.orderCount} order{u.orderCount === 1 ? "" : "s"} placed ·{" "}
													{formatNaira(u.totalSpent)} spent
												</>
											)}
										</p>
									)}
								</div>
								<BanToggleButton
									userId={u.id}
									banned={Boolean(u.bannedUntil)}
									disabled={u.isAdmin || u.id === user.id}
								/>
							</div>
						))}
					</div>
				)}
			</div>
		</AdminLayout>
	);
}
