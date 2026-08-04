import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getFarmerProfile } from "@/lib/data/farmer";
import { pageRoutes } from "@/lib/routes";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ChangePasswordForm from "@/components/dashboard/ChangePasswordForm";

export const metadata: Metadata = {
	title: "Change Password | AgriMarket Nigeria",
};

export default async function SettingsPage() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect(pageRoutes.auth.login);
	}

	const isFarmer = Boolean(user.user_metadata?.is_farmer);
	const farmerProfile = isFarmer ? await getFarmerProfile(supabase, user.id) : null;

	return (
		<DashboardLayout isFarmer={isFarmer} kycStatus={farmerProfile?.kyc_status}>
			<ChangePasswordForm />
		</DashboardLayout>
	);
}
