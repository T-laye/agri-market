"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { pageRoutes } from "@/lib/routes";
import { flattenZodErrors, type FieldErrors } from "@/lib/validations/auth";
import { productSchema } from "@/lib/validations/product";

export type ProductActionState = {
	error: string | null;
	fieldErrors?: FieldErrors;
	success?: string | null;
};

function parseProductForm(formData: FormData) {
	return productSchema.safeParse({
		name: formData.get("name"),
		category: formData.get("category"),
		price: formData.get("price"),
		unit: formData.get("unit"),
		quantity: formData.get("quantity"),
		description: formData.get("description"),
		location: formData.get("location"),
		address: formData.get("address"),
		images: formData.getAll("images").filter(Boolean),
	});
}

export async function createProduct(
	_prevState: ProductActionState,
	formData: FormData
): Promise<ProductActionState> {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return { error: "You must be logged in to do this." };
	}

	const parsed = parseProductForm(formData);
	if (!parsed.success) {
		return { error: "Please fix the errors below", fieldErrors: flattenZodErrors(parsed.error) };
	}

	console.log(
		`[createProduct] farmerId=${user.id} images=${JSON.stringify(parsed.data.images)}`
	);

	const { error } = await supabase.from("products").insert({
		farmer_id: user.id,
		name: parsed.data.name,
		category: parsed.data.category,
		price: parsed.data.price,
		unit: parsed.data.unit,
		quantity: parsed.data.quantity,
		description: parsed.data.description,
		location: parsed.data.location,
		address: parsed.data.address,
		images: parsed.data.images,
	});

	if (error) {
		return { error: error.message };
	}

	revalidatePath(pageRoutes.dashboard.products);
	redirect(pageRoutes.dashboard.products);
}

export async function updateProduct(
	productId: string,
	_prevState: ProductActionState,
	formData: FormData
): Promise<ProductActionState> {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return { error: "You must be logged in to do this." };
	}

	const parsed = parseProductForm(formData);
	if (!parsed.success) {
		return { error: "Please fix the errors below", fieldErrors: flattenZodErrors(parsed.error) };
	}

	console.log(
		`[updateProduct] productId=${productId} farmerId=${user.id} images=${JSON.stringify(parsed.data.images)}`
	);

	const { data, error } = await supabase
		.from("products")
		.update({
			name: parsed.data.name,
			category: parsed.data.category,
			price: parsed.data.price,
			unit: parsed.data.unit,
			quantity: parsed.data.quantity,
			description: parsed.data.description,
			location: parsed.data.location,
			address: parsed.data.address,
			images: parsed.data.images,
		})
		.eq("id", productId)
		.eq("farmer_id", user.id)
		.select();

	console.log(
		`[updateProduct] result rows=${data?.length ?? 0} error=${JSON.stringify(error ?? null)} savedImages=${JSON.stringify(data?.[0]?.images ?? null)}`
	);

	if (error) {
		return { error: error.message };
	}

	if (!data || data.length === 0) {
		return {
			error:
				"Couldn't save changes — this product may no longer belong to your account.",
		};
	}

	revalidatePath(pageRoutes.dashboard.products);
	redirect(pageRoutes.dashboard.products);
}

export async function deleteProduct(productId: string) {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) return;

	await supabase.from("products").delete().eq("id", productId).eq("farmer_id", user.id);

	revalidatePath(pageRoutes.dashboard.products);
}

export async function toggleProductActive(productId: string, isActive: boolean) {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) return;

	await supabase
		.from("products")
		.update({ is_active: isActive })
		.eq("id", productId)
		.eq("farmer_id", user.id);

	revalidatePath(pageRoutes.dashboard.products);
}
