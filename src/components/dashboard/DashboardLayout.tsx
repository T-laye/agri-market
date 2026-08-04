"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HiOutlineSparkles, HiArrowRight } from "react-icons/hi";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VerificationBadge from "@/components/dashboard/VerificationBadge";
import { pageRoutes } from "@/lib/routes";
import type { KycStatus } from "@/lib/data/farmer";

export default function DashboardLayout({
	children,
	isFarmer = false,
	kycStatus,
	wide = false,
}: {
	children: React.ReactNode;
	isFarmer?: boolean;
	kycStatus?: KycStatus;
	wide?: boolean;
}) {
	const pathname = usePathname();

	const tabs = [
		{ label: "Profile", href: pageRoutes.dashboard.profile },
		{ label: "Change Password", href: pageRoutes.dashboard.settings },
		...(isFarmer
			? [
					{ label: "Products", href: pageRoutes.dashboard.products },
					{ label: "Verification", href: pageRoutes.dashboard.verification },
				]
			: []),
	];

	return (
		<>
			<Header transparent={false} />
			<main className="flex-1 pt-24 md:pt-28">
				<div className="custom-container py-10 md:py-14">
					<div className="flex flex-col gap-2 mb-8">
						<div className="flex items-center gap-3 flex-wrap">
							<h1 className="h3 text-neutral-500">Account</h1>
							{isFarmer && kycStatus && <VerificationBadge status={kycStatus} />}
						</div>
						<p className="p1 text-neutral-400">
							Manage your profile and security settings.
						</p>
					</div>

					{!isFarmer && (
						<Link
							href={pageRoutes.becomeFarmer}
							className="flex items-center justify-between gap-4 bg-primary-900 rounded-[15px] px-6 py-5 mb-8 group duration-150 hover:bg-primary-800"
						>
							<div className="flex items-center gap-3">
								<span className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary-500 text-white shrink-0">
									<HiOutlineSparkles className="text-lg" />
								</span>
								<div>
									<p className="text-white font-semibold text-sm">
										Want to sell on AgriMarket?
									</p>
									<p className="text-white/70 text-xs">
										Become a farmer and start listing your produce.
									</p>
								</div>
							</div>
							<HiArrowRight className="text-white text-lg shrink-0 duration-150 group-hover:translate-x-1" />
						</Link>
					)}

					<div className="flex gap-2 border-b border-neutral-200 mb-8">
						{tabs.map((tab) => (
							<Link
								key={tab.href}
								href={tab.href}
								className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px duration-150 whitespace-nowrap ${
									pathname.startsWith(tab.href)
										? "border-primary text-primary"
										: "border-transparent text-neutral-400 hover:text-neutral-500"
								}`}
							>
								{tab.label}
							</Link>
						))}
					</div>

					<div className={wide ? "max-w-4xl" : "max-w-xl"}>{children}</div>
				</div>
			</main>
			<Footer />
		</>
	);
}
