"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { pageRoutes } from "@/lib/routes";

const tabs = [
	{ label: "Produce", href: pageRoutes.marketplace },
	{ label: "Farmers", href: pageRoutes.marketplaceFarmers },
];

export default function MarketplaceTabs() {
	const pathname = usePathname();

	return (
		<div className="flex gap-2">
			{tabs.map((tab) => {
				const isActive = pathname === tab.href;
				return (
					<Link
						key={tab.href}
						href={tab.href}
						className={`rounded-[30px] px-5 py-2 text-sm font-semibold duration-150 ${
							isActive
								? "bg-white text-primary-900"
								: "bg-white/10 text-white hover:bg-white/20"
						}`}
					>
						{tab.label}
					</Link>
				);
			})}
		</div>
	);
}
