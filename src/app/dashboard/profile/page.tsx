import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getFarmerProfile } from "@/lib/data/farmer";
import { resolveAvatarUrl } from "@/lib/avatar";
import { pageRoutes } from "@/lib/routes";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ProfileForm from "@/components/dashboard/ProfileForm";

export const metadata: Metadata = {
	title: "My Profile | AgriMarket Nigeria",
};

export default async function ProfilePage() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect(pageRoutes.auth.login);
	}

	const metadata = user.user_metadata ?? {};
	const isFarmer = Boolean(metadata.is_farmer);
	const farmerProfile = isFarmer ? await getFarmerProfile(supabase, user.id) : null;

	return (
		<DashboardLayout isFarmer={isFarmer} kycStatus={farmerProfile?.kyc_status}>
			<ProfileForm
				userId={user.id}
				email={user.email ?? ""}
				initialName={(metadata.name as string) ?? ""}
				initialPhone={(metadata.phone as string) ?? ""}
				initialAvatarUrl={resolveAvatarUrl(metadata) ?? ""}
				initialAddressState={(metadata.state as string) ?? ""}
				initialCity={(metadata.city as string) ?? ""}
				initialAddress={(metadata.address as string) ?? ""}
				initialLandmark={(metadata.landmark as string) ?? ""}
			/>
		</DashboardLayout>
	);
}
