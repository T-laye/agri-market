"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login, type AuthState } from "@/app/auth/actions";
import Button from "@/components/ui/Button";

const initialState: AuthState = { error: null };

export default function LoginForm({ redirectTo }: { redirectTo: string }) {
	const [state, formAction, pending] = useActionState(login, initialState);

	return (
		<form action={formAction} className="flex flex-col gap-5">
			<input type="hidden" name="redirectTo" value={redirectTo} />

			<div className="flex flex-col gap-1.5">
				<label htmlFor="email" className="text-sm font-medium text-neutral-500">
					Email
				</label>
				<input
					id="email"
					name="email"
					type="email"
					required
					placeholder="you@example.com"
					className="input-class"
				/>
			</div>

			<div className="flex flex-col gap-1.5">
				<div className="flex items-center justify-between">
					<label htmlFor="password" className="text-sm font-medium text-neutral-500">
						Password
					</label>
					<Link href="/forgot-password" className="text-xs text-primary hover:underline">
						Forgot password?
					</Link>
				</div>
				<input
					id="password"
					name="password"
					type="password"
					required
					placeholder="••••••••"
					className="input-class"
				/>
			</div>

			{state.error && <p className="text-sm text-red-600">{state.error}</p>}

			<Button variant="primary" className="w-full" disabled={pending}>
				{pending ? "Logging in…" : "Login"}
			</Button>
		</form>
	);
}
