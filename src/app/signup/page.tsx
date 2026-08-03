import Link from "next/link";
import type { Metadata } from "next";
import AuthLayout from "@/components/auth/AuthLayout";
import SignupForm from "@/components/auth/SignupForm";

export const metadata: Metadata = {
	title: "Sign Up | AgriMarket Nigeria",
};

export default async function SignupPage({
	searchParams,
}: {
	searchParams: Promise<{ role?: string }>;
}) {
	const { role } = await searchParams;
	const defaultRole = role === "farmer" ? "farmer" : "buyer";

	return (
		<AuthLayout
			title="Create your account"
			subtitle="Join AgriMarket to buy or sell fresh produce directly."
			footer={
				<p className="text-sm text-neutral-400 text-center">
					Already have an account?{" "}
					<Link href="/login" className="text-primary font-semibold hover:underline">
						Login
					</Link>
				</p>
			}
		>
			<SignupForm defaultRole={defaultRole} />
		</AuthLayout>
	);
}
