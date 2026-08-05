"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { pageRoutes } from "@/lib/routes";

const tabs = [
	{ label: "Overview", href: pageRoutes.admin.index },
	{ label: "Users", href: pageRoutes.admin.users },
	{ label: "Farmers", href: pageRoutes.admin.farmers },
	{ label: "Products", href: pageRoutes.admin.products },
	{ label: "Orders", href: pageRoutes.admin.orders },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();

	return (
		<>
			<Header transparent={false} />
			<main className="flex-1 pt-24 md:pt-28">
				<div className="custom-container py-10 md:py-14">
					<div className="flex flex-col gap-2 mb-8">
						<span className="bg-primary-900 text-white rounded-[30px] px-4 py-1 text-xs font-semibold w-fit">
							Admin
						</span>
						<h1 className="h3 text-neutral-500">Platform Administration</h1>
						<p className="p1 text-neutral-400">
							Verify farmers, monitor transactions, and keep the marketplace
							healthy.
						</p>
					</div>

					<div className="flex gap-2 border-b border-neutral-200 mb-8 overflow-auto scrollbar-none">
						{tabs.map((tab) => {
							const isActive =
								tab.href === pageRoutes.admin.index
									? pathname === pageRoutes.admin.index
									: pathname.startsWith(tab.href);
							return (
								<Link
									key={tab.href}
									href={tab.href}
									className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px duration-150 whitespace-nowrap ${
										isActive
											? "border-primary text-primary"
											: "border-transparent text-neutral-400 hover:text-neutral-500"
									}`}
								>
									{tab.label}
								</Link>
							);
						})}
					</div>

					{children}
				</div>
			</main>
			<Footer />
		</>
	);
}
