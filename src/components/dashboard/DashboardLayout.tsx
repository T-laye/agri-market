"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { pageRoutes } from "@/lib/routes";

const tabs = [
	{ label: "Profile", href: pageRoutes.dashboard.profile },
	{ label: "Change Password", href: pageRoutes.dashboard.settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();

	return (
		<>
			<Header transparent={false} />
			<main className="flex-1 pt-24 md:pt-28">
				<div className="custom-container py-10 md:py-14">
					<div className="flex flex-col gap-2 mb-8">
						<h1 className="h3 text-neutral-500">Account</h1>
						<p className="p1 text-neutral-400">
							Manage your profile and security settings.
						</p>
					</div>

					<div className="flex gap-2 border-b border-neutral-200 mb-8">
						{tabs.map((tab) => (
							<Link
								key={tab.href}
								href={tab.href}
								className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px duration-150 ${
									pathname === tab.href
										? "border-primary text-primary"
										: "border-transparent text-neutral-400 hover:text-neutral-500"
								}`}
							>
								{tab.label}
							</Link>
						))}
					</div>

					<div className="max-w-xl">{children}</div>
				</div>
			</main>
			<Footer />
		</>
	);
}
