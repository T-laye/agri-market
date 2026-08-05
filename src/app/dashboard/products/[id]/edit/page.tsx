import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { HiArrowLeft } from "react-icons/hi";
import { createClient } from "@/lib/supabase/server";
import { getFarmerProfile } from "@/lib/data/farmer";
import { getProductById } from "@/lib/data/products";
import { pageRoutes } from "@/lib/routes";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ProductForm from "@/components/dashboard/ProductForm";

export const metadata: Metadata = {
	title: "Edit Product | AgriMarket Nigeria",
};

export default async function EditProductPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
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

	const product = await getProductById(supabase, id);
	if (!product || product.farmerId !== user.id) {
		notFound();
	}

	return (
		<DashboardLayout isFarmer kycStatus={profile.kyc_status}>
			<div className="flex flex-col gap-6">
				<div>
					<Link
						href={pageRoutes.dashboard.products}
						className="inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-primary duration-150 mb-3"
					>
						<HiArrowLeft />
						Back to Products
					</Link>
					<h2 className="font-bold text-lg text-neutral-500">Edit Product</h2>
					<p className="text-sm text-neutral-400">Update your product listing.</p>
				</div>
				<ProductForm mode="edit" farmerId={user.id} product={product} />
			</div>
		</DashboardLayout>
	);
}
