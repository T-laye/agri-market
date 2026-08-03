import type { Metadata } from "next";
import AuthLayout from "@/components/auth/AuthLayout";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
	title: "Set New Password | AgriMarket Nigeria",
};

export default function ResetPasswordPage() {
	return (
		<AuthLayout
			title="Set a new password"
			subtitle="Choose a new password for your account."
		>
			<ResetPasswordForm />
		</AuthLayout>
	);
}
