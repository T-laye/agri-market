import type { SupabaseClient } from "@supabase/supabase-js";
import type { FarmerProfile, KycStatus } from "@/lib/data/farmer";
import { getAllOrders } from "@/lib/data/orders";
import { getAllProducts, type Product } from "@/lib/data/products";

export async function getAllFarmerProfiles(
	supabase: SupabaseClient
): Promise<FarmerProfile[]> {
	const { data, error } = await supabase
		.from("farmer_profiles")
		.select("*")
		.order("kyc_status", { ascending: true })
		.order("created_at", { ascending: false });

	if (error || !data) return [];
	return data as FarmerProfile[];
}

export async function getFarmerProfileForAdmin(
	supabase: SupabaseClient,
	farmerId: string
): Promise<FarmerProfile | null> {
	const { data } = await supabase
		.from("farmer_profiles")
		.select("*")
		.eq("id", farmerId)
		.maybeSingle();

	return data as FarmerProfile | null;
}

/** Admin-only: every order platform-wide, most recent first. Thin
 * re-export so admin pages don't need to know this lives in orders.ts. */
export const getAllOrdersForAdmin = getAllOrders;

export type AdminProduct = Product & { unitsSold: number; salesRevenue: number };

/** Every product platform-wide with lifetime units-sold / revenue
 * (from completed order items) attached. */
export async function getAllProductsForAdmin(supabase: SupabaseClient): Promise<AdminProduct[]> {
	const [products, orders] = await Promise.all([
		getAllProducts(supabase),
		getAllOrders(supabase, 500),
	]);

	const unitsSoldByProduct = new Map<string, number>();
	const revenueByProduct = new Map<string, number>();

	for (const order of orders) {
		for (const item of order.items) {
			if (item.status !== "completed" || !item.productId) continue;
			unitsSoldByProduct.set(
				item.productId,
				(unitsSoldByProduct.get(item.productId) ?? 0) + item.quantity
			);
			revenueByProduct.set(
				item.productId,
				(revenueByProduct.get(item.productId) ?? 0) + item.unitPrice * item.quantity
			);
		}
	}

	return products.map((p) => ({
		...p,
		unitsSold: unitsSoldByProduct.get(p.id) ?? 0,
		salesRevenue: revenueByProduct.get(p.id) ?? 0,
	}));
}

export type AdminUser = {
	id: string;
	email: string | null;
	createdAt: string;
	lastSignInAt: string | null;
	isAdmin: boolean;
	isFarmer: boolean;
	bannedUntil: string | null;
	farmName: string | null;
	kycStatus: KycStatus | null;
	productCount: number;
	totalSales: number;
	orderCount: number;
	totalSpent: number;
};

type AuthAdminUser = {
	id: string;
	email?: string;
	created_at: string;
	last_sign_in_at?: string;
	banned_until?: string;
	user_metadata?: Record<string, unknown>;
};

/** Lists every registered account (buyers, farmers, admins) via the Auth
 * Admin API — the only way to see the full roster, since there's no
 * public table backing auth.users and the regular client can't call
 * .auth.admin.*. Requires the service-role client; callers must have
 * already verified the requester is an admin. Enriches each user with
 * their farmer profile (if any), product count, lifetime sales, order
 * count, and lifetime spend. */
export async function getAllUsersForAdmin(
	supabase: SupabaseClient,
	adminClient: SupabaseClient
): Promise<AdminUser[]> {
	const authUsers: AuthAdminUser[] = [];
	const perPage = 200;
	for (let page = 1; ; page++) {
		const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage });
		if (error) throw error;
		const users = (data?.users ?? []) as AuthAdminUser[];
		authUsers.push(...users);
		if (users.length < perPage) break;
	}

	const [farmers, products, orders] = await Promise.all([
		getAllFarmerProfiles(supabase),
		getAllProducts(supabase),
		getAllOrders(supabase, 500),
	]);

	const farmerMap = new Map(farmers.map((f) => [f.id, f]));

	const productCountByFarmer = new Map<string, number>();
	for (const p of products) {
		productCountByFarmer.set(p.farmerId, (productCountByFarmer.get(p.farmerId) ?? 0) + 1);
	}

	const salesByFarmer = new Map<string, number>();
	const orderCountByBuyer = new Map<string, number>();
	const spentByBuyer = new Map<string, number>();

	for (const order of orders) {
		if (order.paymentStatus === "paid") {
			orderCountByBuyer.set(order.buyerId, (orderCountByBuyer.get(order.buyerId) ?? 0) + 1);
			spentByBuyer.set(order.buyerId, (spentByBuyer.get(order.buyerId) ?? 0) + order.totalAmount);
		}
		for (const item of order.items) {
			if (item.status !== "completed") continue;
			salesByFarmer.set(
				item.farmerId,
				(salesByFarmer.get(item.farmerId) ?? 0) + item.unitPrice * item.quantity
			);
		}
	}

	const now = Date.now();

	return authUsers
		.map((u) => {
			const farmer = farmerMap.get(u.id);
			const bannedUntil = u.banned_until && new Date(u.banned_until).getTime() > now
				? u.banned_until
				: null;

			return {
				id: u.id,
				email: u.email ?? null,
				createdAt: u.created_at,
				lastSignInAt: u.last_sign_in_at ?? null,
				isAdmin: Boolean(u.user_metadata?.is_admin),
				isFarmer: Boolean(u.user_metadata?.is_farmer),
				bannedUntil,
				farmName: farmer?.farm_name ?? null,
				kycStatus: farmer?.kyc_status ?? null,
				productCount: productCountByFarmer.get(u.id) ?? 0,
				totalSales: salesByFarmer.get(u.id) ?? 0,
				orderCount: orderCountByBuyer.get(u.id) ?? 0,
				totalSpent: spentByBuyer.get(u.id) ?? 0,
			};
		})
		.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export type AdminStats = {
	totalUsers: number | null;
	bannedUsers: number | null;
	totalFarmers: number;
	pendingKyc: number;
	verifiedFarmers: number;
	totalProducts: number;
	activeProducts: number;
	totalOrders: number;
	paidOrders: number;
	totalRevenue: number;
	platformRevenue: number;
	totalPayoutsPaid: number;
	pendingPayouts: number;
};

/** Platform-wide stats for the admin overview. `totalUsers`/`bannedUsers`
 * are null (rather than 0) when the service-role key isn't configured, so
 * the UI can distinguish "no users" from "can't tell yet". */
export async function getAdminStats(
	supabase: SupabaseClient,
	adminClient?: SupabaseClient
): Promise<AdminStats> {
	const [farmers, products, orders] = await Promise.all([
		getAllFarmerProfiles(supabase),
		getAllProducts(supabase),
		getAllOrders(supabase, 500),
	]);

	const paidOrders = orders.filter((o) => o.paymentStatus === "paid");

	let platformRevenue = 0;
	let totalPayoutsPaid = 0;
	let pendingPayouts = 0;
	for (const order of orders) {
		for (const item of order.items) {
			if (item.status !== "completed") continue;
			platformRevenue += item.platformFeeAmount ?? 0;
			if (item.payoutStatus === "paid") {
				totalPayoutsPaid += item.payoutAmount ?? 0;
			} else if (item.payoutStatus === "pending" || item.payoutStatus === "processing" || item.payoutStatus === "failed") {
				pendingPayouts += 1;
			}
		}
	}

	let totalUsers: number | null = null;
	let bannedUsers: number | null = null;
	if (adminClient) {
		try {
			const users = await getAllUsersForAdmin(supabase, adminClient);
			totalUsers = users.length;
			bannedUsers = users.filter((u) => u.bannedUntil).length;
		} catch {
			// Service-role key missing/invalid — leave as null, UI shows a setup notice.
		}
	}

	return {
		totalUsers,
		bannedUsers,
		totalFarmers: farmers.length,
		pendingKyc: farmers.filter((f) => f.kyc_status === "pending").length,
		verifiedFarmers: farmers.filter((f) => f.kyc_status === "verified").length,
		totalProducts: products.length,
		activeProducts: products.filter((p) => p.isActive).length,
		totalOrders: orders.length,
		paidOrders: paidOrders.length,
		totalRevenue: paidOrders.reduce((sum, o) => sum + o.totalAmount, 0),
		platformRevenue,
		totalPayoutsPaid,
		pendingPayouts,
	};
}
