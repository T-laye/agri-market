import { HiOutlineExclamationCircle } from "react-icons/hi";
import Logo from "@/components/Logo";
import Button from "@/components/ui/Button";
import { pageRoutes } from "@/lib/routes";

export default function NotFound() {
	return (
		<div className="flex flex-1 flex-col items-center justify-center min-h-screen gap-6 px-6 text-center">
			<Logo />
			<span className="w-16 h-16 flex items-center justify-center rounded-full bg-accent-200 text-primary text-3xl">
				<HiOutlineExclamationCircle />
			</span>
			<div className="flex flex-col gap-2">
				<h1 className="h3 text-neutral-500">Page not found</h1>
				<p className="p1 text-neutral-400 max-w-sm">
					The page you&apos;re looking for doesn&apos;t exist or may have been
					moved.
				</p>
			</div>
			<Button href={pageRoutes.home} variant="primary">
				Back to Home
			</Button>
		</div>
	);
}
