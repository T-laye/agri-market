import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MarketplaceView from "@/components/marketplace/MarketplaceView";

export const metadata: Metadata = {
	title: "Marketplace | AgriMarket Nigeria",
	description:
		"Browse fresh produce from verified Nigerian farmers. Search and filter by category, location, and price — no account needed to browse.",
};

export default function MarketplacePage() {
	return (
		<>
			<Header />
			<main className="flex-1">
				<div className="bg-primary-900 pt-28 pb-10 md:pt-36 md:pb-14">
					<div className="custom-container flex flex-col gap-2">
						<h1 className="h3 text-white">Browse Fresh Produce</h1>
						<p className="p1 text-white/75">
							Direct from verified Nigerian farmers. Add items to your cart —
							you can sign up when you&apos;re ready to check out.
						</p>
					</div>
				</div>

				<div className="custom-container py-10 md:py-14">
					<MarketplaceView />
				</div>
			</main>
			<Footer />
		</>
	);
}
