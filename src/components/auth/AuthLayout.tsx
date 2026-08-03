import Image from "next/image";
import Logo from "@/components/Logo";

export default function AuthLayout({
	title,
	subtitle,
	children,
	footer,
}: {
	title: string;
	subtitle: string;
	children: React.ReactNode;
	footer?: React.ReactNode;
}) {
	return (
		<div className="min-h-screen flex">
			<div className="hidden lg:flex lg:w-1/2 relative">
				<Image
					src="/images/home/about.jpg"
					alt="Farmer at work"
					fill
					sizes="50vw"
					quality={85}
					className="object-cover"
				/>
				<div className="absolute inset-0 bg-linear-to-t from-primary-900/90 via-primary-900/40 to-primary-900/60" />

				<div className="relative z-10 flex flex-col justify-between p-10 xl:p-14 w-full">
					<Logo light />

					<div className="flex flex-col gap-4 max-w-md">
						<span className="backdrop-blur-2xl bg-neutral-100/20 border border-white/20 rounded-[30px] px-5 py-2 w-fit text-white text-xs font-medium">
							Direct Farm-to-Buyer Marketplace
						</span>
						<p className="text-2xl font-bold text-white leading-tight">
							Fair prices, secure escrow payments, and a marketplace built for
							Nigerian farmers and buyers.
						</p>
					</div>
				</div>
			</div>

			<div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-12">
				<div className="w-full max-w-sm mx-auto flex flex-col gap-8">
					<div className="lg:hidden">
						<Logo />
					</div>

					<div className="flex flex-col gap-2">
						<h1 className="h3 text-neutral-500">{title}</h1>
						<p className="p1 text-neutral-400">{subtitle}</p>
					</div>

					{children}

					{footer}
				</div>
			</div>
		</div>
	);
}
