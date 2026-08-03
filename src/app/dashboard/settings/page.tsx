import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
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

	return (
		<DashboardLayout>
			<ChangePasswordForm />
		</DashboardLayout>
	);
}
