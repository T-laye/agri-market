import { FaFacebookF, FaInstagram, FaTwitter, FaWhatsapp } from "react-icons/fa";
import Logo from "./Logo";
import { pageRoutes } from "@/lib/routes";

const linkColumns = [
	{
		title: "Marketplace",
		links: [
			{ label: "Browse Produce", href: pageRoutes.marketplace },
			{ label: "Sell as a Farmer", href: `${pageRoutes.auth.signup}?role=farmer` },
			{ label: "How it Works", href: "#how-it-works" },
			{ label: "Market Prices", href: pageRoutes.marketplace },
		],
	},
	{
		title: "Company",
		links: [
			{ label: "About Us", href: "#about" },
			{ label: "FAQ", href: "#faq" },
			{ label: "Contact", href: "#cta" },
		],
	},
	{
		title: "Legal",
		links: [
			{ label: "Terms of Service", href: "#" },
			{ label: "Privacy Policy", href: "#" },
		],
	},
];

const socials = [
	{ icon: FaFacebookF, href: "#" },
	{ icon: FaInstagram, href: "#" },
	{ icon: FaTwitter, href: "#" },
	{ icon: FaWhatsapp, href: "#" },
];

export default function Footer() {
	return (
		<footer className="bg-primary-900 text-white pt-16 pb-8 overflow-hidden">
			<div className="custom-container">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
					<div className="flex flex-col gap-4 lg:col-span-1">
						<Logo light />
						<p className="text-sm text-white/60 leading-6 max-w-xs">
							Connecting Nigerian farmers directly with buyers through
							transparent listings, secure escrow payments, and real-time
							market information.
						</p>
						<div className="flex items-center gap-3 mt-2">
							{socials.map(({ icon: Icon, href }, i) => (
								<a
									key={i}
									href={href}
									className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:scale-125 duration-150"
								>
									<Icon className="text-sm" />
								</a>
							))}
						</div>
					</div>

					<div className="grid grid-cols-2 sm:grid-cols-3 gap-8 lg:col-span-3">
						{linkColumns.map((col) => (
							<div key={col.title} className="flex flex-col gap-4">
								<span className="font-semibold text-sm text-secondary-300">
									{col.title}
								</span>
								<ul className="flex flex-col gap-3">
									{col.links.map((link) => (
										<li key={link.label}>
											<a
												href={link.href}
												className="text-sm text-white/70 hover:text-white hover:font-semibold duration-150"
											>
												{link.label}
											</a>
										</li>
									))}
								</ul>
							</div>
						))}
					</div>
				</div>

				<p className="text-center text-xs text-white/50 pt-6">
					© {new Date().getFullYear()} AgriMarket Nigeria. All rights reserved.
				</p>
			</div>
		</footer>
	);
}
