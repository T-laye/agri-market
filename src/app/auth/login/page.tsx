import Link from "next/link";
import type { Metadata } from "next";
import AuthLayout from "@/components/auth/AuthLayout";
import LoginForm from "@/components/auth/LoginForm";
import { pageRoutes } from "@/lib/routes";

export const metadata: Metadata = {
	title: "Login | AgriMarket Nigeria",
};

export default async function LoginPage({
	searchParams,
}: {
	searchParams: Promise<{ redirect?: string }>;
}) {
	const { redirect } = await searchParams;

	return (
		<AuthLayout
			title="Welcome back"
			subtitle="Login to manage your orders, listings, and account."
			footer={
				<p className="text-sm text-neutral-400 text-center">
					Don&apos;t have an account?{" "}
					<Link href={pageRoutes.auth.signup} className="text-primary font-semibold hover:underline">
						Sign up
					</Link>
				</p>
			}
		>
			<LoginForm redirectTo={redirect || pageRoutes.home} />
		</AuthLayout>
	);
}
