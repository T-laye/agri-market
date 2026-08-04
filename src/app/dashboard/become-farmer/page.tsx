import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { pageRoutes } from "@/lib/routes";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BecomeFarmerForm from "@/components/dashboard/BecomeFarmerForm";

export const metadata: Metadata = {
	title: "Become a Farmer | AgriMarket Nigeria",
};

export default async function BecomeFarmerPage() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect(`${pageRoutes.auth.login}?redirect=${pageRoutes.becomeFarmer}`);
	}

	if (user.user_metadata?.is_farmer) {
		redirect(pageRoutes.dashboard.verification);
	}

	return (
		<>
			<Header transparent={false} />
			<main className="flex-1 pt-24 md:pt-28">
				<div className="custom-container py-10 md:py-14">
					<div className="max-w-lg mx-auto flex flex-col gap-8">
						<div className="flex flex-col gap-2 text-center">
							<span className="bg-secondary-100 text-secondary-700 rounded-[30px] px-5 py-1.5 text-sm font-semibold w-fit mx-auto">
								Sell on AgriMarket
							</span>
							<h1 className="h3 text-neutral-500">Become a Farmer</h1>
							<p className="p1 text-neutral-400">
								Tell us about your farm to start listing produce. You can set
								up your account and add products right away — verification
								happens separately and only affects when your products go
								live in the marketplace.
							</p>
						</div>

						<div className="bg-white border border-neutral-200 rounded-[15px] p-6 md:p-8">
							<BecomeFarmerForm
								initialPhone={(user.user_metadata?.phone as string) ?? ""}
							/>
						</div>
					</div>
				</div>
			</main>
			<Footer />
		</>
	);
}
