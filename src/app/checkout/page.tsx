import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { pageRoutes } from "@/lib/routes";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CheckoutForm from "@/components/checkout/CheckoutForm";

export const metadata: Metadata = {
	title: "Checkout | AgriMarket Nigeria",
};

export default async function CheckoutPage() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect(`${pageRoutes.auth.login}?redirect=${pageRoutes.checkout}`);
	}

	const metadata = user.user_metadata ?? {};

	return (
		<>
			<Header transparent={false} />
			<main className="flex-1 pt-24 md:pt-28">
				<div className="custom-container py-10 md:py-14">
					<div className="flex flex-col gap-2 mb-8">
						<h1 className="h3 text-neutral-500">Checkout</h1>
						<p className="p1 text-neutral-400">
							Review your order and confirm your delivery details.
						</p>
					</div>

					<CheckoutForm
						initialState={(metadata.state as string) ?? ""}
						initialCity={(metadata.city as string) ?? ""}
						initialAddress={(metadata.address as string) ?? ""}
						initialLandmark={(metadata.landmark as string) ?? ""}
					/>
				</div>
			</main>
			<Footer />
		</>
	);
}
