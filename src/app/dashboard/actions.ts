"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { pageRoutes } from "@/lib/routes";
import { flattenZodErrors, type FieldErrors } from "@/lib/validations/auth";
import { updateProfileSchema, changePasswordSchema } from "@/lib/validations/profile";

export type DashboardState = {
	error: string | null;
	fieldErrors?: FieldErrors;
	success?: string | null;
};

export async function updateProfile(
	_prevState: DashboardState,
	formData: FormData
): Promise<DashboardState> {
	const supabase = await createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return { error: "You must be logged in to update your profile." };
	}

	const parsed = updateProfileSchema.safeParse({
		name: formData.get("name"),
		phone: formData.get("phone") ?? "",
		avatarUrl: formData.get("avatarUrl") ?? "",
	});

	if (!parsed.success) {
		return { error: "Please fix the errors below", fieldErrors: flattenZodErrors(parsed.error) };
	}

	const { name, phone, avatarUrl } = parsed.data;

	const { error } = await supabase.auth.updateUser({
		data: {
			...user.user_metadata,
			name,
			phone: phone || null,
			...(avatarUrl ? { avatar_url: avatarUrl } : {}),
		},
	});

	if (error) {
		return { error: error.message };
	}

	revalidatePath(pageRoutes.dashboard.profile);

	return { error: null, success: "Profile updated successfully." };
}

export async function changePassword(
	_prevState: DashboardState,
	formData: FormData
): Promise<DashboardState> {
	const supabase = await createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user?.email) {
		return { error: "You must be logged in to change your password." };
	}

	const parsed = changePasswordSchema.safeParse({
		currentPassword: formData.get("currentPassword"),
		newPassword: formData.get("newPassword"),
		confirmNewPassword: formData.get("confirmNewPassword"),
	});

	if (!parsed.success) {
		return { error: "Please fix the errors below", fieldErrors: flattenZodErrors(parsed.error) };
	}

	const { currentPassword, newPassword } = parsed.data;

	const { error: reauthError } = await supabase.auth.signInWithPassword({
		email: user.email,
		password: currentPassword,
	});

	if (reauthError) {
		return {
			error: "Please fix the errors below",
			fieldErrors: { currentPassword: "Current password is incorrect" },
		};
	}

	const { error } = await supabase.auth.updateUser({ password: newPassword });

	if (error) {
		return { error: error.message };
	}

	return { error: null, success: "Password updated successfully." };
}
