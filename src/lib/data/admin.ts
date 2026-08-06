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

// ---------------------------------------------------------------------------
// Auth Admin API helpers — everything that needs to see beyond RLS (email,
// avatar, phone, delivery address, ban status, signup provider) lives on
// the auth.users record itself, not a public table, so it only ever comes
// from these service-role calls.
// ---------------------------------------------------------------------------

type AuthAdminUser = {
	id: string;
	email?: string;
	created_at: string;
	last_sign_in_at?: string;
	banned_until?: string;
	app_metadata?: { provider?: string };
	user_metadata?: Record<string, unknown>;
};

/** Every registered account (buyers, farmers, admins) via the Auth Admin
 * API — the only way to see the full roster, since there's no public
 * table backing auth.users and the regular client can't call
 * .auth.admin.*. Requires the service-role client; callers must have
 * already verified the requester is an admin. */
async function listAllAuthUsers(adminClient: SupabaseClient): Promise<AuthAdminUser[]> {
	const authUsers: AuthAdminUser[] = [];
	const perPage = 200;
	for (let page = 1; ; page++) {
		const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage });
		if (error) throw error;
		const users = (data?.users ?? []) as AuthAdminUser[];
		authUsers.push(...users);
		if (users.length < perPage) break;
	}
	return authUsers;
}

export type AdminContact = {
	email: string | null;
	name: string | null;
	avatarUrl: string | null;
	// Prefixed with "personal"/"delivery" (rather than phone/state/city/
	// address/landmark) so this merges safely into AdminFarmer alongside
	// FarmerProfile's own `phone` (farm contact) and `state` (farm's
	// operating state) without one silently clobbering the other.
	personalPhone: string | null;
	deliveryState: string | null;
	deliveryCity: string | null;
	deliveryAddress: string | null;
	deliveryLandmark: string | null;
	provider: string | null;
	createdAt: string;
	lastSignInAt: string | null;
	bannedUntil: string | null;
	isAdmin: boolean;
	isFarmer: boolean;
};

/** Pulls the fields a buyer/farmer actually filled in — profile.tsx's
 * updateProfile writes name/phone/custom_avatar_url/state/city/address/
 * landmark into user_metadata, and Google sign-in populates name/
 * avatar_url/picture/email on its own (under slightly different keys,
 * hence the fallbacks — custom_avatar_url always wins if the user
 * uploaded their own photo, see src/lib/avatar.ts). */
function mapAuthUserToContact(u: AuthAdminUser, now: number): AdminContact {
	const meta = u.user_metadata ?? {};
	const bannedUntil =
		u.banned_until && new Date(u.banned_until).getTime() > now ? u.banned_until : null;

	return {
		email: u.email ?? null,
		name: (meta.name as string) || (meta.full_name as string) || null,
		avatarUrl:
			(meta.custom_avatar_url as string) ||
			(meta.avatar_url as string) ||
			(meta.picture as string) ||
			null,
		personalPhone: (meta.phone as string) || null,
		deliveryState: (meta.state as string) || null,
		deliveryCity: (meta.city as string) || null,
		deliveryAddress: (meta.address as string) || null,
		deliveryLandmark: (meta.landmark as string) || null,
		provider: u.app_metadata?.provider ?? null,
		createdAt: u.created_at,
		lastSignInAt: u.last_sign_in_at ?? null,
		bannedUntil,
		isAdmin: Boolean(meta.is_admin),
		isFarmer: Boolean(meta.is_farmer),
	};
}

const EMPTY_CONTACT: AdminContact = {
	email: null,
	name: null,
	avatarUrl: null,
	personalPhone: null,
	deliveryState: null,
	deliveryCity: null,
	deliveryAddress: null,
	deliveryLandmark: null,
	provider: null,
	createdAt: "",
	lastSignInAt: null,
	bannedUntil: null,
	isAdmin: false,
	isFarmer: true,
};

export type AdminUser = AdminContact & {
	id: string;
	farmName: string | null;
	kycStatus: KycStatus | null;
	productCount: number;
	totalSales: number;
	orderCount: number;
	totalSpent: number;
};

/** Every registered account, enriched with their farmer profile (if any),
 * product count, lifetime sales, order count, and lifetime spend. */
export async function getAllUsersForAdmin(
	supabase: SupabaseClient,
	adminClient: SupabaseClient
): Promise<AdminUser[]> {
	const [authUsers, farmers, products, orders] = await Promise.all([
		listAllAuthUsers(adminClient),
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

			return {
				id: u.id,
				...mapAuthUserToContact(u, now),
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

export type AdminFarmer = FarmerProfile &
	AdminContact & {
		productCount: number;
		totalSales: number;
	};

/** Every farmer, with their auth account's contact details (email,
 * personal name, avatar, phone, delivery address) layered on top of their
 * farm/KYC/bank profile. `adminClient` is optional — without it (no
 * service-role key configured) this still returns full farm/KYC data,
 * just without the auth-only contact fields. */
export async function getAllFarmersForAdmin(
	supabase: SupabaseClient,
	adminClient?: SupabaseClient
): Promise<AdminFarmer[]> {
	const [farmers, products, orders, authUsers] = await Promise.all([
		getAllFarmerProfiles(supabase),
		getAllProducts(supabase),
		getAllOrders(supabase, 500),
		adminClient ? listAllAuthUsers(adminClient).catch(() => []) : Promise.resolve([]),
	]);

	const authMap = new Map(authUsers.map((u) => [u.id, u]));

	const productCountByFarmer = new Map<string, number>();
	for (const p of products) {
		productCountByFarmer.set(p.farmerId, (productCountByFarmer.get(p.farmerId) ?? 0) + 1);
	}

	const salesByFarmer = new Map<string, number>();
	for (const order of orders) {
		for (const item of order.items) {
			if (item.status !== "completed") continue;
			salesByFarmer.set(
				item.farmerId,
				(salesByFarmer.get(item.farmerId) ?? 0) + item.unitPrice * item.quantity
			);
		}
	}

	const now = Date.now();

	return farmers.map((farmer) => {
		const authUser = authMap.get(farmer.id);
		return {
			...farmer,
			...(authUser ? mapAuthUserToContact(authUser, now) : EMPTY_CONTACT),
			productCount: productCountByFarmer.get(farmer.id) ?? 0,
			totalSales: salesByFarmer.get(farmer.id) ?? 0,
		};
	});
}

/** Single farmer, same shape as getAllFarmersForAdmin — for the
 * farmer detail/KYC review page. */
export async function getFarmerForAdmin(
	supabase: SupabaseClient,
	farmerId: string,
	adminClient?: SupabaseClient
): Promise<AdminFarmer | null> {
	const farmer = await getFarmerProfileForAdmin(supabase, farmerId);
	if (!farmer) return null;

	const [products, orders] = await Promise.all([
		getAllProducts(supabase),
		getAllOrders(supabase, 500),
	]);

	let contact: AdminContact | null = null;
	if (adminClient) {
		try {
			const { data, error } = await adminClient.auth.admin.getUserById(farmerId);
			if (!error && data.user) {
				contact = mapAuthUserToContact(data.user as AuthAdminUser, Date.now());
			}
		} catch {
			// Service-role key missing/invalid — contact fields just stay null.
		}
	}

	const productCount = products.filter((p) => p.farmerId === farmerId).length;
	const totalSales = orders.reduce((sum, order) => {
		return (
			sum +
			order.items
				.filter((item) => item.farmerId === farmerId && item.status === "completed")
				.reduce((s, item) => s + item.unitPrice * item.quantity, 0)
		);
	}, 0);

	return {
		...farmer,
		...(contact ?? EMPTY_CONTACT),
		productCount,
		totalSales,
	};
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
