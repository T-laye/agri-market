// Server-only helper — uses the Paystack secret key, never import this
// into a Client Component.

const PAYSTACK_BASE_URL = "https://api.paystack.co";

function paystackHeaders() {
	const secretKey = process.env.PAYSTACK_SECRET_KEY;
	if (!secretKey) {
		throw new Error("PAYSTACK_SECRET_KEY is not set");
	}
	return {
		Authorization: `Bearer ${secretKey}`,
		"Content-Type": "application/json",
	};
}

export type InitializeTransactionParams = {
	email: string;
	amountNaira: number;
	reference: string;
	callbackUrl: string;
	metadata?: Record<string, unknown>;
};

export type InitializeTransactionResult = {
	authorizationUrl: string;
	accessCode: string;
	reference: string;
};

export async function initializePaystackTransaction(
	params: InitializeTransactionParams
): Promise<InitializeTransactionResult> {
	const res = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
		method: "POST",
		headers: paystackHeaders(),
		body: JSON.stringify({
			email: params.email,
			amount: Math.round(params.amountNaira * 100), // Paystack expects kobo
			reference: params.reference,
			callback_url: params.callbackUrl,
			currency: "NGN",
			metadata: params.metadata ?? {},
		}),
	});

	const json = await res.json();

	if (!res.ok || !json.status) {
		throw new Error(json.message || "Failed to initialize Paystack transaction");
	}

	return {
		authorizationUrl: json.data.authorization_url,
		accessCode: json.data.access_code,
		reference: json.data.reference,
	};
}

export type VerifyTransactionResult = {
	status: "success" | "failed" | "abandoned" | string;
	amountNaira: number;
	reference: string;
	currency: string;
};

export async function verifyPaystackTransaction(
	reference: string
): Promise<VerifyTransactionResult> {
	const res = await fetch(
		`${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`,
		{
			method: "GET",
			headers: paystackHeaders(),
		}
	);

	const json = await res.json();

	if (!res.ok || !json.status) {
		throw new Error(json.message || "Failed to verify Paystack transaction");
	}

	return {
		status: json.data.status,
		amountNaira: json.data.amount / 100,
		reference: json.data.reference,
		currency: json.data.currency,
	};
}

export type Bank = { name: string; code: string };

let bankListCache: { data: Bank[]; fetchedAt: number } | null = null;
const BANK_LIST_TTL_MS = 24 * 60 * 60 * 1000; // 24h — this list barely changes

export async function listNigerianBanks(): Promise<Bank[]> {
	if (bankListCache && Date.now() - bankListCache.fetchedAt < BANK_LIST_TTL_MS) {
		return bankListCache.data;
	}

	const res = await fetch(`${PAYSTACK_BASE_URL}/bank?country=nigeria&currency=NGN`, {
		method: "GET",
		headers: paystackHeaders(),
	});

	const json = await res.json();

	if (!res.ok || !json.status) {
		throw new Error(json.message || "Failed to fetch bank list");
	}

	// Paystack's list mixes in non-NUBAN entries (e.g. mobile money) and,
	// for defunct/merged banks (Diamond -> Access, etc.), multiple rows that
	// share the same routing code. Keep only real bank accounts and dedupe
	// by code so the code stays a safe unique key (both for the <select>
	// and because it's what we actually route the transfer through).
	const seenCodes = new Set<string>();
	const banks: Bank[] = [];
	for (const b of json.data as { name: string; code: string; type: string }[]) {
		if (b.type !== "nuban" || seenCodes.has(b.code)) continue;
		seenCodes.add(b.code);
		banks.push({ name: b.name, code: b.code });
	}

	bankListCache = { data: banks, fetchedAt: Date.now() };
	return banks;
}

export type ResolvedAccount = { accountNumber: string; accountName: string };

export async function resolveBankAccount(
	accountNumber: string,
	bankCode: string
): Promise<ResolvedAccount> {
	const res = await fetch(
		`${PAYSTACK_BASE_URL}/bank/resolve?account_number=${encodeURIComponent(accountNumber)}&bank_code=${encodeURIComponent(bankCode)}`,
		{ method: "GET", headers: paystackHeaders() }
	);

	const json = await res.json();

	if (!res.ok || !json.status) {
		throw new Error(json.message || "Couldn't verify that account number");
	}

	return {
		accountNumber: json.data.account_number,
		accountName: json.data.account_name,
	};
}

export type CreateRecipientParams = {
	accountName: string;
	accountNumber: string;
	bankCode: string;
};

export async function createTransferRecipient(
	params: CreateRecipientParams
): Promise<string> {
	const res = await fetch(`${PAYSTACK_BASE_URL}/transferrecipient`, {
		method: "POST",
		headers: paystackHeaders(),
		body: JSON.stringify({
			type: "nuban",
			name: params.accountName,
			account_number: params.accountNumber,
			bank_code: params.bankCode,
			currency: "NGN",
		}),
	});

	const json = await res.json();

	if (!res.ok || !json.status) {
		throw new Error(json.message || "Couldn't save this bank account with Paystack");
	}

	return json.data.recipient_code;
}

export type InitiateTransferParams = {
	recipientCode: string;
	amountNaira: number;
	reference: string;
	reason: string;
};

export type TransferResult = {
	status: string;
	transferCode: string;
	reference: string;
};

export async function initiateTransfer(
	params: InitiateTransferParams
): Promise<TransferResult> {
	const res = await fetch(`${PAYSTACK_BASE_URL}/transfer`, {
		method: "POST",
		headers: paystackHeaders(),
		body: JSON.stringify({
			source: "balance",
			amount: Math.round(params.amountNaira * 100),
			recipient: params.recipientCode,
			reference: params.reference,
			reason: params.reason,
			currency: "NGN",
		}),
	});

	const json = await res.json();

	if (!res.ok || !json.status) {
		throw new Error(json.message || "Failed to initiate transfer");
	}

	return {
		status: json.data.status,
		transferCode: json.data.transfer_code,
		reference: json.data.reference,
	};
}
