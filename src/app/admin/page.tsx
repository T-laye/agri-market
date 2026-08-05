import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
	HiOutlineUserGroup,
	HiOutlineUsers,
	HiOutlineClock,
	HiOutlineBadgeCheck,
	HiOutlineShoppingBag,
	HiOutlineCash,
	HiOutlineCube,
	HiOutlineBan,
	HiOutlineTrendingUp,
	HiOutlineExclamationCircle,
} from "react-icons/hi";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminStats } from "@/lib/data/admin";
import { pageRoutes } from "@/lib/routes";
import AdminLayout from "@/components/admin/AdminLayout";

export const metadata: Metadata = {
	title: "Admin Overview | AgriMarket Nigeria",
};

function formatNaira(amount: number) {
	return new Intl.NumberFormat("en-NG", {
		style: "currency",
		currency: "NGN",
		maximumFractionDigits: 0,
	}).format(amount);
}

export default async function AdminOverviewPage() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect(`${pageRoutes.auth.login}?redirect=${pageRoutes.admin.index}`);
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
	const stats = await getAdminStats(supabase, adminClient);

	const cards = [
		{
			label: "Total Users",
			value: stats.totalUsers ?? "—",
			icon: HiOutlineUsers,
			className: "bg-primary-100 text-primary",
			href: pageRoutes.admin.users,
		},
		{
			label: "Banned Users",
			value: stats.bannedUsers ?? "—",
			icon: HiOutlineBan,
			className: "bg-red-100 text-red-600",
			href: pageRoutes.admin.users,
		},
		{
			label: "Total Farmers",
			value: stats.totalFarmers,
			icon: HiOutlineUserGroup,
			className: "bg-primary-100 text-primary",
			href: pageRoutes.admin.farmers,
		},
		{
			label: "Pending Verification",
			value: stats.pendingKyc,
			icon: HiOutlineClock,
			className: "bg-accent-500 text-accent-900",
			href: pageRoutes.admin.farmers,
		},
		{
			label: "Verified Farmers",
			value: stats.verifiedFarmers,
			icon: HiOutlineBadgeCheck,
			className: "bg-secondary-100 text-secondary-700",
			href: pageRoutes.admin.farmers,
		},
		{
			label: "Total Products",
			value: `${stats.activeProducts} / ${stats.totalProducts} active`,
			icon: HiOutlineCube,
			className: "bg-primary-100 text-primary",
			href: pageRoutes.admin.products,
		},
		{
			label: "Paid Orders",
			value: `${stats.paidOrders} / ${stats.totalOrders}`,
			icon: HiOutlineShoppingBag,
			className: "bg-primary-100 text-primary",
			href: pageRoutes.admin.orders,
		},
		{
			label: "Gross Sales (GMV)",
			value: formatNaira(stats.totalRevenue),
			icon: HiOutlineCash,
			className: "bg-secondary-100 text-secondary-700",
			href: pageRoutes.admin.orders,
		},
		{
			label: "Platform Revenue (5% fee)",
			value: formatNaira(stats.platformRevenue),
			icon: HiOutlineTrendingUp,
			className: "bg-secondary-100 text-secondary-700",
		},
		{
			label: "Paid Out to Farmers",
			value: formatNaira(stats.totalPayoutsPaid),
			icon: HiOutlineCash,
			className: "bg-primary-100 text-primary",
			href: pageRoutes.admin.orders,
		},
		{
			label: "Payouts Needing Attention",
			value: stats.pendingPayouts,
			icon: HiOutlineExclamationCircle,
			className: "bg-accent-500 text-accent-900",
			href: pageRoutes.admin.orders,
		},
	];

	return (
		<AdminLayout>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				{cards.map((card) => {
					const Card = (
						<div className="flex items-center gap-4 border border-neutral-200 rounded-[15px] p-5 h-full duration-150 hover:border-primary">
							<span
								className={`w-12 h-12 flex items-center justify-center rounded-full text-xl shrink-0 ${card.className}`}
							>
								<card.icon />
							</span>
							<div>
								<p className="text-xs text-neutral-400">{card.label}</p>
								<p className="font-bold text-xl text-neutral-500">{card.value}</p>
							</div>
						</div>
					);

					return card.href ? (
						<Link key={card.label} href={card.href}>
							{Card}
						</Link>
					) : (
						<div key={card.label}>{Card}</div>
					);
				})}
			</div>

			{stats.totalUsers === null && (
				<div className="mt-6 flex items-start gap-3 bg-accent-500 text-accent-900 rounded-[10px] p-4">
					<HiOutlineExclamationCircle className="text-xl shrink-0 mt-0.5" />
					<p className="text-sm leading-6">
						User counts are unavailable — add{" "}
						<code className="font-mono text-xs bg-black/10 px-1 py-0.5 rounded">
							SUPABASE_SERVICE_ROLE_KEY
						</code>{" "}
						to your environment to enable the Users tab.
					</p>
				</div>
			)}

			{stats.pendingKyc > 0 && (
				<Link
					href={pageRoutes.admin.farmers}
					className="mt-6 flex items-center justify-between gap-4 bg-primary-900 rounded-[15px] px-6 py-5 text-white duration-150 hover:bg-primary-800"
				>
					<p className="text-sm font-semibold">
						{stats.pendingKyc} farmer{stats.pendingKyc === 1 ? "" : "s"} waiting on
						verification review
					</p>
					<span className="text-sm font-semibold underline">Review now</span>
				</Link>
			)}
		</AdminLayout>
	);
}
