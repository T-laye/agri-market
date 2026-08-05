import { redirect } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getAllProductsForAdmin } from "@/lib/data/admin";
import { pageRoutes } from "@/lib/routes";
import AdminLayout from "@/components/admin/AdminLayout";

export const metadata: Metadata = {
	title: "Products | Admin | AgriMarket Nigeria",
};

function formatNaira(amount: number) {
	return new Intl.NumberFormat("en-NG", {
		style: "currency",
		currency: "NGN",
		maximumFractionDigits: 0,
	}).format(amount);
}

export default async function AdminProductsPage() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect(`${pageRoutes.auth.login}?redirect=${pageRoutes.admin.products}`);
	}
	if (!user.user_metadata?.is_admin) {
		redirect(pageRoutes.home);
	}

	const products = await getAllProductsForAdmin(supabase);

	return (
		<AdminLayout>
			<div className="flex flex-col gap-6">
				<div>
					<h2 className="font-bold text-lg text-neutral-500">Products</h2>
					<p className="text-sm text-neutral-400">
						{products.length} listed across all farmers
					</p>
				</div>

				{products.length === 0 ? (
					<div className="flex flex-col items-center justify-center gap-2 py-20 text-center border border-dashed border-neutral-200 rounded-[15px]">
						<p className="text-neutral-500 font-semibold">No products yet</p>
					</div>
				) : (
					<div className="flex flex-col divide-y divide-neutral-200 border border-neutral-200 rounded-[15px] overflow-hidden">
						{products.map((product) => (
							<div key={product.id} className="flex items-center gap-4 p-4">
								<span className="relative w-14 h-14 rounded-[10px] overflow-hidden bg-neutral-100 shrink-0">
									<Image
										src={product.image}
										alt={product.name}
										fill
										sizes="56px"
										className="object-cover"
									/>
								</span>
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2 flex-wrap">
										<p className="font-semibold text-sm text-neutral-500 truncate">
											{product.name}
										</p>
										<span
											className={`rounded-[30px] text-[10px] font-semibold px-2.5 py-1 shrink-0 ${
												product.isActive
													? "bg-secondary-100 text-secondary-700"
													: "bg-neutral-100 text-neutral-400"
											}`}
										>
											{product.isActive ? "Active" : "Inactive"}
										</span>
									</div>
									<p className="text-xs text-neutral-400 mt-0.5 truncate">
										{product.farmerName} · {product.category} ·{" "}
										{formatNaira(product.price)} / {product.unit}
									</p>
								</div>
								<div className="text-right shrink-0">
									<p className="text-sm font-bold text-neutral-500">
										{formatNaira(product.salesRevenue)}
									</p>
									<p className="text-xs text-neutral-400">
										{product.unitsSold} {product.unit} sold
									</p>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</AdminLayout>
	);
}
