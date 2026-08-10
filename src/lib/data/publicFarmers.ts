import type { SupabaseClient } from "@supabase/supabase-js";

export type PublicFarmer = {
	id: string;
	farmName: string;
	state: string;
	productCount: number;
};

/** Every verified farmer, for the marketplace's "Farmers" section — same
 * verified-only rule as product visibility. Goes through a SECURITY
 * DEFINER function since farmer_profiles' own RLS would otherwise hide
 * every farmer from everyone but themselves and admins (see
 * 0012_farmer_favorites.sql). */
export async function getPublicFarmers(supabase: SupabaseClient): Promise<PublicFarmer[]> {
	const { data, error } = await supabase.rpc("get_public_farmers");
	if (error || !data) return [];

	return (
		data as { id: string; farm_name: string; state: string; product_count: number | string }[]
	).map((row) => ({
		id: row.id,
		farmName: row.farm_name,
		state: row.state,
		productCount: Number(row.product_count),
	}));
}

/** The current user's favorited farmer ids, as a Set for quick lookup. */
export async function getFavoriteFarmerIds(
	supabase: SupabaseClient,
	userId: string
): Promise<Set<string>> {
	const { data, error } = await supabase
		.from("farmer_favorites")
		.select("farmer_id")
		.eq("buyer_id", userId);

	if (error || !data) return new Set();
	return new Set(data.map((row) => row.farmer_id as string));
}
