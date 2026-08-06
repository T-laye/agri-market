"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login, type AuthState } from "@/app/auth/actions";
import Button from "@/components/ui/Button";
import PasswordInput from "@/components/auth/PasswordInput";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";
import { pageRoutes } from "@/lib/routes";

const initialState: AuthState = { error: null };

export default function LoginForm({ redirectTo }: { redirectTo: string }) {
	const [state, formAction, pending] = useActionState(login, initialState);

	return (
		<div className="flex flex-col gap-5">
			<GoogleAuthButton redirectTo={redirectTo} />

			<div className="flex items-center gap-3">
				<div className="h-px flex-1 bg-neutral-200" />
				<span className="text-xs text-neutral-400">or login with email</span>
				<div className="h-px flex-1 bg-neutral-200" />
			</div>

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
						placeholder="you@example.com"
						className="input-class"
					/>
					{state.fieldErrors?.email && (
						<span className="text-xs text-red-600">{state.fieldErrors.email}</span>
					)}
				</div>

				<div className="flex flex-col gap-1.5">
					<div className="flex items-center justify-between">
						<label htmlFor="password" className="text-sm font-medium text-neutral-500">
							Password
						</label>
						<Link href={pageRoutes.auth.forgotPassword} className="text-xs text-primary hover:underline">
							Forgot password?
						</Link>
					</div>
					<PasswordInput
						id="password"
						name="password"
						placeholder="••••••••"
						className="input-class"
					/>
					{state.fieldErrors?.password && (
						<span className="text-xs text-red-600">{state.fieldErrors.password}</span>
					)}
				</div>

				{state.error && <p className="text-sm text-red-600">{state.error}</p>}

				<Button variant="primary" className="w-full" disabled={pending}>
					{pending ? "Logging in…" : "Login"}
				</Button>
			</form>
		</div>
	);
}
