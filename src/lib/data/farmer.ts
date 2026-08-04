import type { SupabaseClient } from "@supabase/supabase-js";

export type KycStatus = "not_submitted" | "pending" | "verified" | "rejected";

export type FarmerProfile = {
	id: string;
	farm_name: string;
	state: string;
	phone: string;
	kyc_status: KycStatus;
	kyc_documents: { type: string; url: string }[];
	rejection_reason: string | null;
	verified_at: string | null;
};

export async function getFarmerProfile(
	supabase: SupabaseClient,
	userId: string
): Promise<FarmerProfile | null> {
	const { data } = await supabase
		.from("farmer_profiles")
		.select("*")
		.eq("id", userId)
		.maybeSingle();

	return data as FarmerProfile | null;
}
