"use client";

import { useActionState } from "react";
import { saveBankDetails, type PayoutSettingsState } from "@/app/dashboard/payout-settings/actions";
import type { Bank } from "@/lib/paystack";
import Button from "@/components/ui/Button";

const initialState: PayoutSettingsState = { error: null };

export default function BankDetailsForm({
	banks,
	currentBankCode,
}: {
	banks: Bank[];
	currentBankCode: string;
}) {
	const [state, formAction, pending] = useActionState(saveBankDetails, initialState);

	return (
		<form action={formAction} className="flex flex-col gap-5">
			<div className="flex flex-col gap-1.5">
				<label htmlFor="bankCode" className="text-sm font-medium text-neutral-500">
					Bank
				</label>
				<select
					id="bankCode"
					name="bankCode"
					defaultValue={currentBankCode}
					className="select-class"
				>
					<option value="" disabled>
						Select your bank
					</option>
					{banks.map((bank) => (
						<option key={bank.code} value={bank.code}>
							{bank.name}
						</option>
					))}
				</select>
				{state.fieldErrors?.bankCode && (
					<span className="text-xs text-red-600">{state.fieldErrors.bankCode}</span>
				)}
			</div>

			<div className="flex flex-col gap-1.5">
				<label htmlFor="accountNumber" className="text-sm font-medium text-neutral-500">
					Account number
				</label>
				<input
					id="accountNumber"
					name="accountNumber"
					type="text"
					inputMode="numeric"
					maxLength={10}
					placeholder="0123456789"
					className="input-class"
				/>
				{state.fieldErrors?.accountNumber && (
					<span className="text-xs text-red-600">{state.fieldErrors.accountNumber}</span>
				)}
			</div>

			{state.error && !state.fieldErrors && (
				<p className="text-sm text-red-600">{state.error}</p>
			)}
			{state.success && <p className="text-sm text-secondary-700">{state.success}</p>}

			<Button variant="primary" className="w-fit" disabled={pending}>
				{pending ? "Verifying…" : "Verify & Save"}
			</Button>
		</form>
	);
}
