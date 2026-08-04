import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { HiOutlineClock, HiOutlineBadgeCheck } from "react-icons/hi";
import { createClient } from "@/lib/supabase/server";
import { getFarmerProfile } from "@/lib/data/farmer";
import { pageRoutes } from "@/lib/routes";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import VerificationBadge from "@/components/dashboard/VerificationBadge";
import KycUploadForm from "@/components/dashboard/KycUploadForm";

export const metadata: Metadata = {
	title: "Verification | AgriMarket Nigeria",
};

export default async function VerificationPage() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect(`${pageRoutes.auth.login}?redirect=${pageRoutes.dashboard.verification}`);
	}

	if (!user.user_metadata?.is_farmer) {
		redirect(pageRoutes.becomeFarmer);
	}

	const profile = await getFarmerProfile(supabase, user.id);

	if (!profile) {
		redirect(pageRoutes.becomeFarmer);
	}

	return (
		<DashboardLayout isFarmer kycStatus={profile.kyc_status}>
			<div className="flex flex-col gap-6">
				<div className="flex flex-col gap-2">
					<span className="text-sm font-medium text-neutral-500">
						Verification status
					</span>
					<VerificationBadge status={profile.kyc_status} />
				</div>

				{profile.kyc_status === "verified" && (
					<div className="flex items-start gap-3 bg-secondary-100 text-secondary-700 rounded-[10px] p-4">
						<HiOutlineBadgeCheck className="text-xl shrink-0 mt-0.5" />
						<p className="text-sm leading-6">
							You&apos;re a verified farmer. Your products are visible to
							buyers in the marketplace.
						</p>
					</div>
				)}

				{profile.kyc_status === "pending" && (
					<div className="flex items-start gap-3 bg-accent-500 text-accent-900 rounded-[10px] p-4">
						<HiOutlineClock className="text-xl shrink-0 mt-0.5" />
						<p className="text-sm leading-6">
							Your documents are under review. This usually takes 1-2 business
							days. Your products stay saved but won&apos;t appear in the
							marketplace until you&apos;re verified.
						</p>
					</div>
				)}

				{profile.kyc_status === "rejected" && (
					<div className="flex flex-col gap-3">
						<div className="bg-red-50 text-red-600 rounded-[10px] p-4 text-sm leading-6">
							{profile.rejection_reason ||
								"Your submission couldn't be verified. Please re-upload clear, valid documents."}
						</div>
						<KycUploadForm userId={user.id} />
					</div>
				)}

				{profile.kyc_status === "not_submitted" && (
					<div className="flex flex-col gap-4">
						<p className="p1 text-neutral-400">
							Upload the documents below so our team can verify your farm.
							You can keep setting up your account and adding products in the
							meantime — they just won&apos;t be visible to buyers until
							you&apos;re verified.
						</p>
						<KycUploadForm userId={user.id} />
					</div>
				)}
			</div>
		</DashboardLayout>
	);
}
