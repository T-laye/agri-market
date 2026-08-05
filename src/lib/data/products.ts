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
	farmer_profiles: { farm_name: string; kyc_status: string } | null;
};

function mapProductRow(row: ProductRow): Product {
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
		farmerName: row.farmer_profiles?.farm_name ?? "AgriMarket Farmer",
		farmerVerified: row.farmer_profiles?.kyc_status === "verified",
		createdAt: row.created_at,
	};
}

const PRODUCT_SELECT = "*, farmer_profiles(farm_name, kyc_status)";

/** Public marketplace listing — RLS already restricts this to active
 * products from verified farmers, the explicit filter here just keeps
 * behaviour consistent for a farmer who's logged in while browsing. */
export async function getMarketplaceProducts(
	supabase: SupabaseClient,
): Promise<Product[]> {
	const { data, error } = await supabase
		.from("products")
		.select(PRODUCT_SELECT)
		.eq("is_active", true)
		.order("created_at", { ascending: false });

	if (error || !data) return [];
	return (data as unknown as ProductRow[]).map(mapProductRow);
}

/** A farmer's own products, any status (active/inactive, verified or not). */
export async function getFarmerProducts(
	supabase: SupabaseClient,
	farmerId: string,
): Promise<Product[]> {
	const { data, error } = await supabase
		.from("products")
		.select(PRODUCT_SELECT)
		.eq("farmer_id", farmerId)
		.order("created_at", { ascending: false });

	if (error || !data) return [];
	return (data as unknown as ProductRow[]).map(mapProductRow);
}

export async function getProductById(
	supabase: SupabaseClient,
	id: string,
): Promise<Product | null> {
	const { data, error } = await supabase
		.from("products")
		.select(PRODUCT_SELECT)
		.eq("id", id)
		.maybeSingle();

	console.log(
		"[getProductById] id=" +
			id +
			" images=" +
			JSON.stringify((data as { images?: unknown } | null)?.images ?? null) +
			" error=" +
			JSON.stringify(error ?? null)
	);

	return data ? mapProductRow(data as unknown as ProductRow) : null;
}
