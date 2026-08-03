import Link from "next/link";
import type { Metadata } from "next";
import AuthLayout from "@/components/auth/AuthLayout";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
	title: "Reset Password | AgriMarket Nigeria",
};

export default function ForgotPasswordPage() {
	return (
		<AuthLayout
			title="Forgot your password?"
			subtitle="Enter your email and we'll send you a link to reset it."
			footer={
				<p className="text-sm text-neutral-400 text-center">
					Remembered it?{" "}
					<Link href="/login" className="text-primary font-semibold hover:underline">
						Back to login
					</Link>
				</p>
			}
		>
			<ForgotPasswordForm />
		</AuthLayout>
	);
}
