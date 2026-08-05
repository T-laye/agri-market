import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { HiOutlineBadgeCheck, HiOutlineExclamationCircle } from "react-icons/hi";
import { createClient } from "@/lib/supabase/server";
import { getFarmerProfile } from "@/lib/data/farmer";
import { listNigerianBanks } from "@/lib/paystack";
import { pageRoutes } from "@/lib/routes";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import BankDetailsForm from "@/components/dashboard/BankDetailsForm";

export const metadata: Metadata = {
	title: "Payout Settings | AgriMarket Nigeria",
};

export default async function PayoutSettingsPage() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect(`${pageRoutes.auth.login}?redirect=${pageRoutes.dashboard.payoutSettings}`);
	}

	if (!user.user_metadata?.is_farmer) {
		redirect(pageRoutes.becomeFarmer);
	}

	const profile = await getFarmerProfile(supabase, user.id);
	if (!profile) {
		redirect(pageRoutes.becomeFarmer);
	}

	let banks: Awaited<ReturnType<typeof listNigerianBanks>> = [];
	let banksError = false;
	try {
		banks = await listNigerianBanks();
	} catch {
		banksError = true;
	}

	const hasPayoutAccount = Boolean(profile.paystack_recipient_code);

	return (
		<DashboardLayout isFarmer kycStatus={profile.kyc_status}>
			<div className="flex flex-col gap-6">
				<div>
					<h2 className="font-bold text-lg text-neutral-500">Payout Settings</h2>
					<p className="text-sm text-neutral-400">
						Add the bank account you want to receive payments into. Once a buyer
						confirms delivery, your earnings are transferred here automatically.
					</p>
				</div>

				{hasPayoutAccount && (
					<div className="flex items-start gap-3 bg-secondary-100 text-secondary-700 rounded-[10px] p-4">
						<HiOutlineBadgeCheck className="text-xl shrink-0 mt-0.5" />
						<div className="text-sm leading-6">
							<p className="font-semibold">Payout account on file</p>
							<p>
								{profile.account_name} — {profile.bank_name} ({profile.account_number})
							</p>
						</div>
					</div>
				)}

				{banksError ? (
					<div className="flex items-start gap-3 bg-red-50 text-red-600 rounded-[10px] p-4">
						<HiOutlineExclamationCircle className="text-xl shrink-0 mt-0.5" />
						<p className="text-sm leading-6">
							Couldn&apos;t load the bank list right now. Please refresh the page
							to try again.
						</p>
					</div>
				) : (
					<BankDetailsForm banks={banks} currentBankCode={profile.bank_code ?? ""} />
				)}
			</div>
		</DashboardLayout>
	);
}
