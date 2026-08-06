/** Resolves which avatar to actually display for a user.
 *
 * A user-uploaded photo (stored under `custom_avatar_url`) always wins
 * over whatever an OAuth provider supplies — Supabase re-syncs `avatar_url`
 * (and `picture`, for Google) into user_metadata on every OAuth sign-in,
 * which would otherwise silently overwrite a photo the user chose
 * themselves the next time they sign in with Google. Only falls back to
 * the provider's photo when there's no custom one on file. */
export function resolveAvatarUrl(
	metadata: Record<string, unknown> | null | undefined
): string | null {
	if (!metadata) return null;
	return (
		(metadata.custom_avatar_url as string) ||
		(metadata.avatar_url as string) ||
		(metadata.picture as string) ||
		null
	);
}
