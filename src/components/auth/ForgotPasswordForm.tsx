"use client";

import { useActionState } from "react";
import { requestPasswordReset, type AuthState } from "@/app/auth/actions";
import Button from "@/components/ui/Button";

const initialState: AuthState = { error: null };

export default function ForgotPasswordForm() {
	const [state, formAction, pending] = useActionState(
		requestPasswordReset,
		initialState
	);

	if (state.success) {
		return (
			<div className="rounded-[10px] bg-secondary-100 text-secondary-700 p-4 text-sm leading-6">
				{state.success}
			</div>
		);
	}

	return (
		<form action={formAction} className="flex flex-col gap-5">
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

			{state.error && <p className="text-sm text-red-600">{state.error}</p>}

			<Button variant="primary" className="w-full" disabled={pending}>
				{pending ? "Sending…" : "Send Reset Link"}
			</Button>
		</form>
	);
}
