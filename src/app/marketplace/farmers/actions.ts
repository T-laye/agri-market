"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { pageRoutes } from "@/lib/routes";

export type FavoriteActionResult = { error: string | null; favorited?: boolean };

export async function toggleFavoriteFarmer(farmerId: string): Promise<FavoriteActionResult> {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return { error: "Log in to save favorite farmers." };
	}

	const { data: existing } = await supabase
		.from("farmer_favorites")
		.select("farmer_id")
		.eq("buyer_id", user.id)
		.eq("farmer_id", farmerId)
		.maybeSingle();

	if (existing) {
		const { error } = await supabase
			.from("farmer_favorites")
			.delete()
			.eq("buyer_id", user.id)
			.eq("farmer_id", farmerId);

		if (error) return { error: error.message };

		revalidatePath(pageRoutes.marketplaceFarmers);
		revalidatePath(pageRoutes.marketplace);
		return { error: null, favorited: false };
	}

	const { error } = await supabase
		.from("farmer_favorites")
		.insert({ buyer_id: user.id, farmer_id: farmerId });

	if (error) return { error: error.message };

	revalidatePath(pageRoutes.marketplaceFarmers);
	revalidatePath(pageRoutes.marketplace);
	return { error: null, favorited: true };
}
