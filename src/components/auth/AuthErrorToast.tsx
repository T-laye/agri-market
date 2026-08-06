"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

const ERROR_MESSAGES: Record<string, string> = {
	"auth-callback-failed": "That link has expired or already been used. Please try again.",
	"google-auth-failed": "Google sign-in didn't go through. Please try again.",
};

/** Reads ?error= off the URL (set by /auth/callback and signInWithGoogle
 * on failure), surfaces it as a toast, then strips it from the URL. */
export default function AuthErrorToast() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const pathname = usePathname();
	const error = searchParams.get("error");

	useEffect(() => {
		if (!error) return;

		toast.error(ERROR_MESSAGES[error] ?? "Something went wrong. Please try again.");

		const params = new URLSearchParams(searchParams);
		params.delete("error");
		router.replace(params.size ? `${pathname}?${params}` : pathname);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [error]);

	return null;
}
