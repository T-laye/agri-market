import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { HiOutlinePlus, HiOutlineExclamationCircle } from "react-icons/hi";
import { createClient } from "@/lib/supabase/server";
import { getFarmerProfile } from "@/lib/data/farmer";
import { getFarmerProducts } from "@/lib/data/products";
import { pageRoutes } from "@/lib/routes";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ProductRowActions from "@/components/dashboard/ProductRowActions";
import Button from "@/components/ui/Button";

export const metadata: Metadata = {
	title: "My Products | AgriMarket Nigeria",
};

function formatNaira(amount: number) {
	return new Intl.NumberFormat("en-NG", {
		style: "currency",
		currency: "NGN",
		maximumFractionDigits: 0,
	}).format(amount);
}

export default async function ProductsPage() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect(`${pageRoutes.auth.login}?redirect=${pageRoutes.dashboard.products}`);
	}

	if (!user.user_metadata?.is_farmer) {
		redirect(pageRoutes.becomeFarmer);
	}

	const profile = await getFarmerProfile(supabase, user.id);
	if (!profile) {
		redirect(pageRoutes.becomeFarmer);
	}

	const products = await getFarmerProducts(supabase, user.id);
	const isVerified = profile.kyc_status === "verified";

	return (
		<DashboardLayout isFarmer kycStatus={profile.kyc_status} wide>
			<div className="flex flex-col gap-6">
				<div className="flex items-center justify-between gap-4 flex-wrap">
					<div>
						<h2 className="font-bold text-lg text-neutral-500">My Products</h2>
						<p className="text-sm text-neutral-400">
							{products.length} {products.length === 1 ? "product" : "products"} listed
						</p>
					</div>
					<Button href={`${pageRoutes.dashboard.products}/new`} variant="primary" className="min-w-0">
						<HiOutlinePlus className="mr-1.5 text-lg" />
						Add Product
					</Button>
				</div>

				{!isVerified && (
					<div className="flex items-start gap-3 bg-accent-500 text-accent-900 rounded-[10px] p-4">
						<HiOutlineExclamationCircle className="text-xl shrink-0 mt-0.5" />
						<p className="text-sm leading-6">
							Your products are saved but won&apos;t appear in the marketplace
							until your account is verified.{" "}
							<Link href={pageRoutes.dashboard.verification} className="font-semibold underline">
								Check verification status
							</Link>
						</p>
					</div>
				)}

				{products.length === 0 ? (
					<div className="flex flex-col items-center justify-center gap-3 py-20 text-center border border-dashed border-neutral-200 rounded-[15px]">
						<p className="text-neutral-500 font-semibold">No products yet</p>
						<p className="text-sm text-neutral-400 max-w-xs">
							Add your first product to start selling on AgriMarket.
						</p>
						<Button href={`${pageRoutes.dashboard.products}/new`} variant="primary" className="mt-2">
							Add Product
						</Button>
					</div>
				) : (
					<div className="flex flex-col divide-y divide-neutral-200 border border-neutral-200 rounded-[15px] overflow-hidden">
						{products.map((product) => (
							<div
								key={product.id}
								className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4"
							>
								<div className="flex items-center gap-4 flex-1 min-w-0">
									<div className="relative w-16 h-16 rounded-[10px] overflow-hidden shrink-0 bg-neutral-100">
										<Image
											src={product.image}
											alt={product.name}
											fill
											sizes="64px"
											className="object-cover"
											unoptimized
										/>
									</div>

									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2 flex-wrap">
											<p className="font-semibold text-sm text-neutral-500 truncate">
												{product.name}
											</p>
											<span
												className={`text-[10px] font-bold px-2 py-0.5 rounded-[30px] shrink-0 ${
													product.isActive
														? "bg-secondary-100 text-secondary-700"
														: "bg-neutral-100 text-neutral-400"
												}`}
											>
												{product.isActive ? "Active" : "Inactive"}
											</span>
										</div>
										<p className="text-xs text-neutral-400">
											{product.category} · {product.quantity} in stock
										</p>
									</div>
								</div>

								<div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pl-20 sm:pl-0">
									<span className="font-bold text-primary text-sm">
										{formatNaira(product.price)}
									</span>

									<ProductRowActions productId={product.id} isActive={product.isActive} />
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</DashboardLayout>
	);
}
