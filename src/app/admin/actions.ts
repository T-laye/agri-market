"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { pageRoutes } from "@/lib/routes";

export type AdminActionResult = { error: string | null };

async function requireAdmin() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user || !user.user_metadata?.is_admin) {
		return { supabase, user: null, isAdmin: false as const };
	}

	return { supabase, user, isAdmin: true as const };
}

export async function approveFarmerKyc(farmerId: string): Promise<AdminActionResult> {
	const { supabase, isAdmin } = await requireAdmin();
	if (!isAdmin) {
		return { error: "You don't have permission to do this." };
	}

	const { error } = await supabase
		.from("farmer_profiles")
		.update({
			kyc_status: "verified",
			verified_at: new Date().toISOString(),
			rejection_reason: null,
		})
		.eq("id", farmerId);

	if (error) {
		return { error: error.message };
	}

	revalidatePath(pageRoutes.admin.farmers);
	revalidatePath(`${pageRoutes.admin.farmers}/${farmerId}`);
	return { error: null };
}

export async function rejectFarmerKyc(
	farmerId: string,
	reason: string
): Promise<AdminActionResult> {
	const { supabase, isAdmin } = await requireAdmin();
	if (!isAdmin) {
		return { error: "You don't have permission to do this." };
	}

	if (!reason.trim()) {
		return { error: "Please provide a reason for rejection." };
	}

	const { error } = await supabase
		.from("farmer_profiles")
		.update({
			kyc_status: "rejected",
			rejection_reason: reason.trim(),
		})
		.eq("id", farmerId);

	if (error) {
		return { error: error.message };
	}

	revalidatePath(pageRoutes.admin.farmers);
	revalidatePath(`${pageRoutes.admin.farmers}/${farmerId}`);
	return { error: null };
}

/** Blocks an account from signing in (a Supabase Auth ban, not a row
 * delete — reversible, and existing sessions stop refreshing almost
 * immediately). Admin accounts can't be banned from here, and you can't
 * ban yourself, to avoid accidental lockouts. */
export async function banUser(userId: string): Promise<AdminActionResult> {
	const { user, isAdmin } = await requireAdmin();
	if (!isAdmin || !user) {
		return { error: "You don't have permission to do this." };
	}
	if (user.id === userId) {
		return { error: "You can't ban your own account." };
	}

	let adminClient;
	try {
		adminClient = createAdminClient();
	} catch {
		return { error: "SUPABASE_SERVICE_ROLE_KEY isn't configured — see .env.local." };
	}

	const { data: target, error: fetchError } = await adminClient.auth.admin.getUserById(userId);
	if (fetchError || !target?.user) {
		return { error: "User not found." };
	}
	if (target.user.user_metadata?.is_admin) {
		return { error: "Admins can't be banned from here." };
	}

	// ~100 years — Supabase's ban_duration has no literal "forever", this is
	// the conventional stand-in. Reversible any time via unbanUser.
	const { error: banError } = await adminClient.auth.admin.updateUserById(userId, {
		ban_duration: "876000h",
	});
	if (banError) {
		return { error: banError.message };
	}

	revalidatePath(pageRoutes.admin.users);
	return { error: null };
}

export async function unbanUser(userId: string): Promise<AdminActionResult> {
	const { isAdmin } = await requireAdmin();
	if (!isAdmin) {
		return { error: "You don't have permission to do this." };
	}

	let adminClient;
	try {
		adminClient = createAdminClient();
	} catch {
		return { error: "SUPABASE_SERVICE_ROLE_KEY isn't configured — see .env.local." };
	}

	const { error } = await adminClient.auth.admin.updateUserById(userId, {
		ban_duration: "none",
	});
	if (error) {
		return { error: error.message };
	}

	revalidatePath(pageRoutes.admin.users);
	return { error: null };
}
