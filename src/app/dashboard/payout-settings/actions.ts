"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { pageRoutes } from "@/lib/routes";
import { flattenZodErrors, type FieldErrors } from "@/lib/validations/auth";
import { bankDetailsSchema } from "@/lib/validations/payout";
import { listNigerianBanks, resolveBankAccount, createTransferRecipient } from "@/lib/paystack";

export type PayoutSettingsState = {
	error: string | null;
	fieldErrors?: FieldErrors;
	success?: string | null;
};

export async function saveBankDetails(
	_prevState: PayoutSettingsState,
	formData: FormData
): Promise<PayoutSettingsState> {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return { error: "You must be logged in to do this." };
	}

	const parsed = bankDetailsSchema.safeParse({
		bankCode: formData.get("bankCode"),
		accountNumber: formData.get("accountNumber"),
	});

	if (!parsed.success) {
		return { error: "Please fix the errors below", fieldErrors: flattenZodErrors(parsed.error) };
	}

	const { bankCode, accountNumber } = parsed.data;

	let bankName = "";
	try {
		const banks = await listNigerianBanks();
		bankName = banks.find((b) => b.code === bankCode)?.name ?? "";
	} catch {
		return { error: "Couldn't load the bank list right now. Please try again." };
	}

	if (!bankName) {
		return { error: "Please select a valid bank." };
	}

	let accountName: string;
	try {
		const resolved = await resolveBankAccount(accountNumber, bankCode);
		accountName = resolved.accountName;
	} catch (err) {
		return {
			error:
				err instanceof Error
					? err.message
					: "Couldn't verify that account number. Please check and try again.",
		};
	}

	let recipientCode: string;
	try {
		recipientCode = await createTransferRecipient({
			accountName,
			accountNumber,
			bankCode,
		});
	} catch (err) {
		return {
			error:
				err instanceof Error
					? err.message
					: "Couldn't save this bank account. Please try again.",
		};
	}

	const { error } = await supabase
		.from("farmer_profiles")
		.update({
			bank_code: bankCode,
			bank_name: bankName,
			account_number: accountNumber,
			account_name: accountName,
			paystack_recipient_code: recipientCode,
		})
		.eq("id", user.id);

	if (error) {
		return { error: error.message };
	}

	revalidatePath(pageRoutes.dashboard.payoutSettings);

	return {
		error: null,
		success: `Payout account confirmed: ${accountName} — ${bankName}.`,
	};
}
