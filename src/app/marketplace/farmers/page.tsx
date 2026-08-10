import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MarketplaceTabs from "@/components/marketplace/MarketplaceTabs";
import FarmersView from "@/components/marketplace/FarmersView";
import { createClient } from "@/lib/supabase/server";
import { getPublicFarmers, getFavoriteFarmerIds } from "@/lib/data/publicFarmers";

export const metadata: Metadata = {
	title: "Farmers | AgriMarket Nigeria",
	description:
		"Browse verified Nigerian farmers on AgriMarket and save your favorites for quick access.",
};

export default async function MarketplaceFarmersPage() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	const [farmers, favoriteIds] = await Promise.all([
		getPublicFarmers(supabase),
		user ? getFavoriteFarmerIds(supabase, user.id) : Promise.resolve(new Set<string>()),
	]);

	return (
		<>
			<Header />
			<main className="flex-1">
				<div className="bg-primary-900 pt-28 pb-10 md:pt-36 md:pb-14">
					<div className="custom-container flex flex-col gap-5">
						<div className="flex flex-col gap-2">
							<h1 className="h3 text-white">Meet Our Farmers</h1>
							<p className="p1 text-white/75">
								Verified Nigerian farmers selling directly on AgriMarket. Star your
								favorites to keep them close.
							</p>
						</div>
						<MarketplaceTabs />
					</div>
				</div>

				<div className="custom-container py-10 md:py-14">
					<FarmersView farmers={farmers} favoriteIds={[...favoriteIds]} />
				</div>
			</main>
			<Footer />
		</>
	);
}
