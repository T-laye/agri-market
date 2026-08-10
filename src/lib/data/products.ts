import type { SupabaseClient } from "@supabase/supabase-js";

export type ProductCategory =
	| "Vegetables"
	| "Fruits"
	| "Tubers & Roots"
	| "Grains & Legumes";

export type Product = {
	id: string;
	farmerId: string;
	name: string;
	category: ProductCategory;
	price: number;
	unit: string;
	quantity: number;
	description: string;
	images: string[];
	image: string;
	location: string;
	address: string;
	isActive: boolean;
	farmerName: string;
	farmerVerified: boolean;
	rating?: number;
	createdAt: string;
};

export const categories: ProductCategory[] = [
	"Vegetables",
	"Fruits",
	"Tubers & Roots",
	"Grains & Legumes",
];

export const locations = [
	"Abia",
	"Adamawa",
	"Akwa Ibom",
	"Anambra",
	"Bauchi",
	"Bayelsa",
	"Benue",
	"Borno",
	"Cross River",
	"Delta",
	"Ebonyi",
	"Edo",
	"Ekiti",
	"Enugu",
	"Gombe",
	"Imo",
	"Jigawa",
	"Kaduna",
	"Kano",
	"Katsina",
	"Kebbi",
	"Kogi",
	"Kwara",
	"Lagos",
	"Nasarawa",
	"Niger",
	"Ogun",
	"Ondo",
	"Osun",
	"Oyo",
	"Plateau",
	"Rivers",
	"Sokoto",
	"Taraba",
	"Yobe",
	"Zamfara",
];

const FALLBACK_IMAGE = "/images/products/market-stall.jpg";

type ProductRow = {
	id: string;
	farmer_id: string;
	name: string;
	category: ProductCategory;
	price: number | string;
	unit: string;
	quantity: number;
	description: string;
	images: unknown;
	location: string;
	address: string;
	is_active: boolean;
	created_at: string;
};

type FarmerInfo = { farmName: string; verified: boolean };

function mapProductRow(row: ProductRow, farmer: FarmerInfo | undefined): Product {
	const images = Array.isArray(row.images) ? (row.images as string[]) : [];

	return {
		id: row.id,
		farmerId: row.farmer_id,
		name: row.name,
		category: row.category,
		price: Number(row.price),
		unit: row.unit,
		quantity: row.quantity,
		description: row.description,
		images,
		image: images[0] ?? FALLBACK_IMAGE,
		location: row.location,
		address: row.address,
		isActive: row.is_active,
		farmerName: farmer?.farmName ?? "AgriMarket Farmer",
		farmerVerified: farmer?.verified ?? false,
		createdAt: row.created_at,
	};
}

/** Batch-fetches (farm_name, kyc_status) for a set of farmer ids via a
 * SECURITY DEFINER function — a plain embedded join against
 * farmer_profiles(farm_name, kyc_status) silently comes back null for
 * anyone but that farmer or an admin, since farmer_profiles has its own
 * RLS. See 0011_fix_marketplace_visibility.sql. */
async function fetchFarmerInfo(
	supabase: SupabaseClient,
	rows: ProductRow[]
): Promise<Map<string, FarmerInfo>> {
	const farmerIds = [...new Set(rows.map((r) => r.farmer_id))];
	const map = new Map<string, FarmerInfo>();
	if (farmerIds.length === 0) return map;

	const { data } = await supabase.rpc("get_public_farmer_info", {
		p_farmer_ids: farmerIds,
	});

	for (const f of (data ?? []) as { id: string; farm_name: string; kyc_status: string }[]) {
		map.set(f.id, { farmName: f.farm_name, verified: f.kyc_status === "verified" });
	}
	return map;
}

async function mapProductRows(
	supabase: SupabaseClient,
	rows: ProductRow[]
): Promise<Product[]> {
	const farmerInfo = await fetchFarmerInfo(supabase, rows);
	return rows.map((row) => mapProductRow(row, farmerInfo.get(row.farmer_id)));
}

/** Public marketplace listing — RLS already restricts this to active
 * products from verified farmers, the explicit filter here just keeps
 * behaviour consistent for a farmer who's logged in while browsing. */
export async function getMarketplaceProducts(
	supabase: SupabaseClient,
): Promise<Product[]> {
	const { data, error } = await supabase
		.from("products")
		.select("*")
		.eq("is_active", true)
		.order("created_at", { ascending: false });

	if (error || !data) return [];
	return mapProductRows(supabase, data as unknown as ProductRow[]);
}

/** A farmer's own products, any status (active/inactive, verified or not). */
export async function getFarmerProducts(
	supabase: SupabaseClient,
	farmerId: string,
): Promise<Product[]> {
	const { data, error } = await supabase
		.from("products")
		.select("*")
		.eq("farmer_id", farmerId)
		.order("created_at", { ascending: false });

	if (error || !data) return [];
	return mapProductRows(supabase, data as unknown as ProductRow[]);
}

/** Admin-only: every product platform-wide, regardless of farmer
 * verification or active status. RLS grants admins SELECT on products
 * (see 0007_admin.sql). */
export async function getAllProducts(supabase: SupabaseClient): Promise<Product[]> {
	const { data, error } = await supabase
		.from("products")
		.select("*")
		.order("created_at", { ascending: false });

	if (error || !data) return [];
	return mapProductRows(supabase, data as unknown as ProductRow[]);
}

export async function getProductById(
	supabase: SupabaseClient,
	id: string,
): Promise<Product | null> {
	const { data, error } = await supabase
		.from("products")
		.select("*")
		.eq("id", id)
		.maybeSingle();

	if (error || !data) return null;

	const row = data as unknown as ProductRow;
	const farmerInfo = await fetchFarmerInfo(supabase, [row]);
	return mapProductRow(row, farmerInfo.get(row.farmer_id));
}
