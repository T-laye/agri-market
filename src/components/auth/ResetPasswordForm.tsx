"use client";

import { useActionState, useState } from "react";
import { updatePassword, type AuthState } from "@/app/auth/actions";
import Button from "@/components/ui/Button";
import PasswordInput from "@/components/auth/PasswordInput";

const initialState: AuthState = { error: null };

export default function ResetPasswordForm() {
	const [state, formAction, pending] = useActionState(updatePassword, initialState);
	const [password, setPassword] = useState("");
	const [confirm, setConfirm] = useState("");

	const mismatch = confirm.length > 0 && password !== confirm;

	return (
		<form action={formAction} className="flex flex-col gap-5">
			<div className="flex flex-col gap-1.5">
				<label htmlFor="password" className="text-sm font-medium text-neutral-500">
					New password
				</label>
				<PasswordInput
					id="password"
					name="password"
					placeholder="At least 6 characters"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					className="input-class"
				/>
				{state.fieldErrors?.password && (
					<span className="text-xs text-red-600">{state.fieldErrors.password}</span>
				)}
			</div>

			<div className="flex flex-col gap-1.5">
				<label htmlFor="confirmPassword" className="text-sm font-medium text-neutral-500">
					Confirm password
				</label>
				<PasswordInput
					id="confirmPassword"
					name="confirmPassword"
					placeholder="Re-enter password"
					value={confirm}
					onChange={(e) => setConfirm(e.target.value)}
					className="input-class"
				/>
				{mismatch && (
					<span className="text-xs text-red-600">Passwords do not match</span>
				)}
				{!mismatch && state.fieldErrors?.confirmPassword && (
					<span className="text-xs text-red-600">{state.fieldErrors.confirmPassword}</span>
				)}
			</div>

			{state.error && <p className="text-sm text-red-600">{state.error}</p>}

			<Button
				variant="primary"
				className="w-full"
				disabled={pending || mismatch || password.length === 0}
			>
				{pending ? "Updating…" : "Update Password"}
			</Button>
		</form>
	);
}
