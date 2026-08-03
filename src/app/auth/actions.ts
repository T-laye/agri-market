"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthState = {
	error: string | null;
	success?: string | null;
};

function siteUrl() {
	return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export async function login(
	_prevState: AuthState,
	formData: FormData
): Promise<AuthState> {
	const supabase = await createClient();

	const email = formData.get("email") as string;
	const password = formData.get("password") as string;
	const redirectTo = (formData.get("redirectTo") as string) || "/";

	const { error } = await supabase.auth.signInWithPassword({ email, password });

	if (error) {
		return { error: error.message };
	}

	redirect(redirectTo);
}

export async function signup(
	_prevState: AuthState,
	formData: FormData
): Promise<AuthState> {
	const supabase = await createClient();

	const name = formData.get("name") as string;
	const email = formData.get("email") as string;
	const password = formData.get("password") as string;
	const role = formData.get("role") as string;

	const { error } = await supabase.auth.signUp({
		email,
		password,
		options: {
			data: { name, role },
			emailRedirectTo: `${siteUrl()}/auth/callback`,
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
	formData: FormData
): Promise<AuthState> {
	const supabase = await createClient();
	const email = formData.get("email") as string;

	const { error } = await supabase.auth.resetPasswordForEmail(email, {
		redirectTo: `${siteUrl()}/auth/callback?next=/reset-password`,
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
	formData: FormData
): Promise<AuthState> {
	const supabase = await createClient();
	const password = formData.get("password") as string;

	const { error } = await supabase.auth.updateUser({ password });

	if (error) {
		return { error: error.message };
	}

	redirect("/login?reset=success");
}

export async function signOut() {
	const supabase = await createClient();
	await supabase.auth.signOut();
	redirect("/login");
}
