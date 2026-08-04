"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { pageRoutes } from "@/lib/routes";
import { flattenZodErrors, type FieldErrors } from "@/lib/validations/auth";
import { becomeFarmerSchema, kycSubmitSchema } from "@/lib/validations/farmer";

export type FarmerActionState = {
	error: string | null;
	fieldErrors?: FieldErrors;
	success?: string | null;
};

export async function becomeFarmer(
	_prevState: FarmerActionState,
	formData: FormData
): Promise<FarmerActionState> {
	const supabase = await createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return { error: "You must be logged in to do this." };
	}

	const parsed = becomeFarmerSchema.safeParse({
		farmName: formData.get("farmName"),
		state: formData.get("state"),
		phone: formData.get("phone"),
	});

	if (!parsed.success) {
		return { error: "Please fix the errors below", fieldErrors: flattenZodErrors(parsed.error) };
	}

	const { farmName, state, phone } = parsed.data;

	const { error: profileError } = await supabase.from("farmer_profiles").insert({
		id: user.id,
		farm_name: farmName,
		state,
		phone,
	});

	if (profileError) {
		if (profileError.code === "23505") {
			return { error: "You're already registered as a farmer." };
		}
		return { error: profileError.message };
	}

	const { error: metaError } = await supabase.auth.updateUser({
		data: { ...user.user_metadata, is_farmer: true },
	});

	if (metaError) {
		return { error: metaError.message };
	}

	revalidatePath(pageRoutes.dashboard.index, "layout");
	redirect(pageRoutes.dashboard.verification);
}

export async function submitKyc(
	_prevState: FarmerActionState,
	formData: FormData
): Promise<FarmerActionState> {
	const supabase = await createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return { error: "You must be logged in to do this." };
	}

	const parsed = kycSubmitSchema.safeParse({
		idDocumentUrl: formData.get("idDocumentUrl"),
		proofDocumentUrl: formData.get("proofDocumentUrl"),
	});

	if (!parsed.success) {
		return { error: "Please fix the errors below", fieldErrors: flattenZodErrors(parsed.error) };
	}

	const { idDocumentUrl, proofDocumentUrl } = parsed.data;

	const { error } = await supabase
		.from("farmer_profiles")
		.update({
			kyc_status: "pending",
			kyc_documents: [
				{ type: "government_id", url: idDocumentUrl },
				{ type: "proof_of_farm", url: proofDocumentUrl },
			],
		})
		.eq("id", user.id);

	if (error) {
		return { error: error.message };
	}

	revalidatePath(pageRoutes.dashboard.verification);

	return { error: null, success: "Documents submitted! We'll review them shortly." };
}
