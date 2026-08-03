"use client";

import { useActionState } from "react";
import { changePassword, type DashboardState } from "@/app/dashboard/actions";
import Button from "@/components/ui/Button";
import PasswordInput from "@/components/auth/PasswordInput";

const initialState: DashboardState = { error: null };

export default function ChangePasswordForm() {
	const [state, formAction, pending] = useActionState(changePassword, initialState);

	return (
		<form action={formAction} className="flex flex-col gap-5">
			<div className="flex flex-col gap-1.5">
				<label htmlFor="currentPassword" className="text-sm font-medium text-neutral-500">
					Current password
				</label>
				<PasswordInput
					id="currentPassword"
					name="currentPassword"
					placeholder="••••••••"
					className="input-class"
				/>
				{state.fieldErrors?.currentPassword && (
					<span className="text-xs text-red-600">{state.fieldErrors.currentPassword}</span>
				)}
			</div>

			<div className="flex flex-col gap-1.5">
				<label htmlFor="newPassword" className="text-sm font-medium text-neutral-500">
					New password
				</label>
				<PasswordInput
					id="newPassword"
					name="newPassword"
					placeholder="At least 6 characters"
					className="input-class"
				/>
				{state.fieldErrors?.newPassword && (
					<span className="text-xs text-red-600">{state.fieldErrors.newPassword}</span>
				)}
			</div>

			<div className="flex flex-col gap-1.5">
				<label htmlFor="confirmNewPassword" className="text-sm font-medium text-neutral-500">
					Confirm new password
				</label>
				<PasswordInput
					id="confirmNewPassword"
					name="confirmNewPassword"
					placeholder="Re-enter new password"
					className="input-class"
				/>
				{state.fieldErrors?.confirmNewPassword && (
					<span className="text-xs text-red-600">{state.fieldErrors.confirmNewPassword}</span>
				)}
			</div>

			{state.error && !state.fieldErrors && (
				<p className="text-sm text-red-600">{state.error}</p>
			)}
			{state.success && <p className="text-sm text-secondary-700">{state.success}</p>}

			<Button variant="primary" className="w-fit" disabled={pending}>
				{pending ? "Updating…" : "Update Password"}
			</Button>
		</form>
	);
}
