"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { pageRoutes } from "@/lib/routes";
import {
	loginSchema,
	signupSchema,
	forgotPasswordSchema,
	resetPasswordSchema,
	flattenZodErrors,
	type FieldErrors,
} from "@/lib/validations/auth";

export type AuthState = {
	error: string | null;
	fieldErrors?: FieldErrors;
	success?: string | null;
};

function siteUrl() {
	return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export async function login(
	_prevState: AuthState,
	formData: FormData,
): Promise<AuthState> {
	const parsed = loginSchema.safeParse({
		email: formData.get("email"),
		password: formData.get("password"),
	});

	if (!parsed.success) {
		return { error: "Please fix the errors below", fieldErrors: flattenZodErrors(parsed.error) };
	}

	const redirectTo = (formData.get("redirectTo") as string) || pageRoutes.marketplace;

	const supabase = await createClient();
	const { error } = await supabase.auth.signInWithPassword(parsed.data);

	if (error) {
		return { error: error.message };
	}

	redirect(redirectTo);
}

export async function signup(
	_prevState: AuthState,
	formData: FormData,
): Promise<AuthState> {
	const parsed = signupSchema.safeParse({
		name: formData.get("name"),
		email: formData.get("email"),
		password: formData.get("password"),
		role: formData.get("role"),
	});

	if (!parsed.success) {
		return { error: "Please fix the errors below", fieldErrors: flattenZodErrors(parsed.error) };
	}

	const { name, email, password, role } = parsed.data;

	const supabase = await createClient();
	const { error } = await supabase.auth.signUp({
		email,
		password,
		options: {
			data: { name, role },
			emailRedirectTo: `${siteUrl()}/auth/callback?next=${pageRoutes.marketplace}`,
		},
	});

	if (error) {
		return { error: error.message };
	}

	return {
		error: null,
		success:
			"Account created! Check your email to confirm your address before logging in.",
	};
}

export async function requestPasswordReset(
	_prevState: AuthState,
	formData: FormData,
): Promise<AuthState> {
	const parsed = forgotPasswordSchema.safeParse({
		email: formData.get("email"),
	});

	if (!parsed.success) {
		return { error: "Please fix the errors below", fieldErrors: flattenZodErrors(parsed.error) };
	}

	const supabase = await createClient();
	const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
		redirectTo: `${siteUrl()}/auth/callback?next=${pageRoutes.auth.resetPassword}`,
	});

	if (error) {
		return { error: error.message };
	}

	return {
		error: null,
		success: "If an account exists for that email, a reset link is on its way.",
	};
}

export async function updatePassword(
	_prevState: AuthState,
	formData: FormData,
): Promise<AuthState> {
	const parsed = resetPasswordSchema.safeParse({
		password: formData.get("password"),
		confirmPassword: formData.get("confirmPassword"),
	});

	if (!parsed.success) {
		return { error: "Please fix the errors below", fieldErrors: flattenZodErrors(parsed.error) };
	}

	const supabase = await createClient();
	const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

	if (error) {
		return { error: error.message };
	}

	redirect(`${pageRoutes.auth.login}?reset=success`);
}

export async function signOut() {
	const supabase = await createClient();
	await supabase.auth.signOut();
	redirect(pageRoutes.auth.login);
}
