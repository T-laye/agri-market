import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { HiArrowLeft } from "react-icons/hi";
import { createClient } from "@/lib/supabase/server";
import { getFarmerProfile } from "@/lib/data/farmer";
import { pageRoutes } from "@/lib/routes";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ProductForm from "@/components/dashboard/ProductForm";

export const metadata: Metadata = {
	title: "Add Product | AgriMarket Nigeria",
};

export default async function NewProductPage() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect(`${pageRoutes.auth.login}?redirect=${pageRoutes.dashboard.products}/new`);
	}

	if (!user.user_metadata?.is_farmer) {
		redirect(pageRoutes.becomeFarmer);
	}

	const profile = await getFarmerProfile(supabase, user.id);
	if (!profile) {
		redirect(pageRoutes.becomeFarmer);
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
					<h2 className="font-bold text-lg text-neutral-500">Add Product</h2>
					<p className="text-sm text-neutral-400">
						List a new product for buyers to discover.
					</p>
				</div>
				<ProductForm mode="create" farmerId={user.id} />
			</div>
		</DashboardLayout>
	);
}
