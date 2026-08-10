import type { SupabaseClient } from "@supabase/supabase-js";

export type PublicFarmer = {
	id: string;
	farmName: string;
	state: string;
	productCount: number;
	avatarUrl: string | null;
};

type PublicFarmerRow = {
	id: string;
	farm_name: string;
	state: string;
	product_count: number | string;
	avatar_url: string | null;
};

function mapPublicFarmerRow(row: PublicFarmerRow): PublicFarmer {
	return {
		id: row.id,
		farmName: row.farm_name,
		state: row.state,
		productCount: Number(row.product_count),
		avatarUrl: row.avatar_url,
	};
}

/** Every verified farmer, for the marketplace's "Farmers" section — same
 * verified-only rule as product visibility. Goes through a SECURITY
 * DEFINER function since farmer_profiles' own RLS would otherwise hide
 * every farmer from everyone but themselves and admins (see
 * 0012_farmer_favorites.sql, 0013_farmer_detail_page.sql). */
export async function getPublicFarmers(supabase: SupabaseClient): Promise<PublicFarmer[]> {
	const { data, error } = await supabase.rpc("get_public_farmers");
	if (error || !data) return [];
	return (data as PublicFarmerRow[]).map(mapPublicFarmerRow);
}

/** A single verified farmer's public profile, for the farmer detail page.
 * Returns null if the id doesn't exist or isn't a verified farmer. */
export async function getPublicFarmer(
	supabase: SupabaseClient,
	farmerId: string
): Promise<PublicFarmer | null> {
	const { data, error } = await supabase.rpc("get_public_farmer", { p_farmer_id: farmerId });
	if (error || !data || data.length === 0) return null;
	return mapPublicFarmerRow((data as PublicFarmerRow[])[0]);
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
