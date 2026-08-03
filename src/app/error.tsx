"use client";

import { useEffect } from "react";
import { HiOutlineExclamationTriangle } from "react-icons/hi2";
import Logo from "@/components/Logo";
import Button from "@/components/ui/Button";
import { pageRoutes } from "@/lib/routes";

export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<div className="flex flex-1 flex-col items-center justify-center min-h-screen gap-6 px-6 text-center">
			<Logo />
			<span className="w-16 h-16 flex items-center justify-center rounded-full bg-red-100 text-red-600 text-3xl">
				<HiOutlineExclamationTriangle />
			</span>
			<div className="flex flex-col gap-2">
				<h1 className="h3 text-neutral-500">Something went wrong</h1>
				<p className="p1 text-neutral-400 max-w-sm">
					An unexpected error occurred. You can try again or head back home.
				</p>
			</div>
			<div className="flex gap-4">
				<Button variant="primary" onClick={reset}>
					Try Again
				</Button>
				<Button
					href={pageRoutes.home}
					variant="ghost"
					className="!text-primary !border-primary hover:!bg-primary-100"
				>
					Back to Home
				</Button>
			</div>
		</div>
	);
}
