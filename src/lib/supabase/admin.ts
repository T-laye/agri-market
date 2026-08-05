import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/** Server-only client using the Supabase service role key. This bypasses
 * RLS entirely and unlocks the Auth Admin API (list/ban users) — there's
 * no other way to enumerate every registered account, since the regular
 * client can't see into auth.users.
 *
 * Never import this into a Client Component. Every caller must verify
 * the requesting user is an admin (via the normal session-based client)
 * BEFORE reaching for this one. */
export function createAdminClient() {
	const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

	if (!url || !serviceRoleKey) {
		throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
	}

	return createSupabaseClient(url, serviceRoleKey, {
		auth: { autoRefreshToken: false, persistSession: false },
	});
}
