"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { banUser, unbanUser } from "@/app/admin/actions";

export default function BanToggleButton({
	userId,
	banned,
	disabled,
}: {
	userId: string;
	banned: boolean;
	disabled?: boolean;
}) {
	const [isPending, startTransition] = useTransition();
	const router = useRouter();

	function handleClick() {
		const confirmMessage = banned
			? "Unban this user? They'll be able to sign in again."
			: "Ban this user? They won't be able to sign in until unbanned.";
		if (!window.confirm(confirmMessage)) return;

		startTransition(async () => {
			const result = banned ? await unbanUser(userId) : await banUser(userId);
			if (result.error) {
				toast.error(result.error);
				return;
			}
			toast.success(banned ? "User unbanned" : "User banned");
			router.refresh();
		});
	}

	if (disabled) return null;

	return (
		<button
			onClick={handleClick}
			disabled={isPending}
			className={`rounded-[30px] px-4 py-2 text-xs font-semibold border duration-150 disabled:opacity-50 shrink-0 ${
				banned
					? "border-secondary-500 text-secondary-700 hover:bg-secondary-100"
					: "border-red-200 text-red-600 hover:bg-red-50"
			}`}
		>
			{isPending ? "Working…" : banned ? "Unban" : "Ban"}
		</button>
	);
}
