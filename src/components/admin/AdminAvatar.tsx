import Image from "next/image";

/** Small circular avatar with an initials fallback. Uses `unoptimized`
 * because avatarUrl can be a Google-hosted picture (lh3.googleusercontent.com)
 * as much as a Supabase storage URL — same pattern Header.tsx already uses
 * for the account menu, so we don't need to allowlist every possible host. */
export default function AdminAvatar({
	avatarUrl,
	name,
	size = 40,
}: {
	avatarUrl: string | null;
	name: string | null;
	size?: number;
}) {
	const initial = (name || "?").charAt(0).toUpperCase();

	return (
		<span
			className="relative rounded-full overflow-hidden bg-secondary-500 shrink-0 flex items-center justify-center"
			style={{ width: size, height: size }}
		>
			{avatarUrl ? (
				<Image
					src={avatarUrl}
					alt={name ?? "Avatar"}
					fill
					sizes={`${size}px`}
					className="object-cover"
					unoptimized
				/>
			) : (
				<span
					className="text-white font-bold"
					style={{ fontSize: size * 0.4 }}
				>
					{initial}
				</span>
			)}
		</span>
	);
}
