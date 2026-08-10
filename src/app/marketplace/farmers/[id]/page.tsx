import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { HiOutlineArrowLeft, HiOutlineLocationMarker, HiOutlineCube, HiOutlineBadgeCheck } from "react-icons/hi";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Avatar from "@/components/Avatar";
import FavoriteStarButton from "@/components/marketplace/FavoriteStarButton";
import FarmerProductsGrid from "@/components/marketplace/FarmerProductsGrid";
import { createClient } from "@/lib/supabase/server";
import { getPublicFarmer, getFavoriteFarmerIds } from "@/lib/data/publicFarmers";
import { getPublicFarmerProducts } from "@/lib/data/products";
import { pageRoutes } from "@/lib/routes";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ id: string }>;
}): Promise<Metadata> {
	const { id } = await params;
	const supabase = await createClient();
	const farmer = await getPublicFarmer(supabase, id);

	return {
		title: farmer ? `${farmer.farmName} | AgriMarket Nigeria` : "Farmer | AgriMarket Nigeria",
		description: farmer
			? `Browse fresh produce from ${farmer.farmName}, a verified farmer in ${farmer.state} State on AgriMarket Nigeria.`
			: undefined,
	};
}

export default async function FarmerDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	const [farmer, products, favoriteIds] = await Promise.all([
		getPublicFarmer(supabase, id),
		getPublicFarmerProducts(supabase, id),
		user ? getFavoriteFarmerIds(supabase, user.id) : Promise.resolve(new Set<string>()),
	]);

	if (!farmer) {
		notFound();
	}

	return (
		<>
			<Header />
			<main className="flex-1">
				<div className="bg-primary-900 pt-28 pb-10 md:pt-36 md:pb-14">
					<div className="custom-container flex flex-col gap-6">
						<Link
							href={pageRoutes.marketplaceFarmers}
							className="flex items-center gap-2 text-sm font-medium text-white/75 hover:text-white w-fit"
						>
							<HiOutlineArrowLeft /> Back to Farmers
						</Link>

						<div className="flex items-center gap-5">
							<Avatar avatarUrl={farmer.avatarUrl} name={farmer.farmName} size={88} />
							<div className="flex flex-col gap-2">
								<div className="flex items-center gap-3 flex-wrap">
									<h1 className="h3 text-white">{farmer.farmName}</h1>
									<span className="flex items-center gap-1 text-xs font-semibold bg-white/15 text-white rounded-[30px] px-3 py-1">
										<HiOutlineBadgeCheck /> Verified Farmer
									</span>
								</div>
								<div className="flex items-center gap-4 text-sm text-white/75">
									<span className="flex items-center gap-1">
										<HiOutlineLocationMarker /> {farmer.state} State
									</span>
									<span className="flex items-center gap-1">
										<HiOutlineCube /> {farmer.productCount}{" "}
										{farmer.productCount === 1 ? "product" : "products"}
									</span>
								</div>
							</div>
							<FavoriteStarButton
								farmerId={farmer.id}
								initialFavorited={favoriteIds.has(farmer.id)}
								className="ml-auto bg-white/10 w-11 h-11 hover:bg-white/20"
							/>
						</div>
					</div>
				</div>

				<div className="custom-container py-10 md:py-14">
					<h2 className="font-bold text-lg text-neutral-500 mb-6">
						Produce from {farmer.farmName}
					</h2>
					<FarmerProductsGrid products={products} />
				</div>
			</main>
			<Footer />
		</>
	);
}
