import type { Metadata } from "next";
import localFont from "next/font/local";
import { Toaster } from "sonner";
import "./globals.css";

const figtree = localFont({
	src: [
		{
			path: "../../public/fonts/figtree/Figtree-Light.ttf",
			weight: "300",
			style: "normal",
		},
		{
			path: "../../public/fonts/figtree/Figtree-Regular.ttf",
			weight: "400",
			style: "normal",
		},
		{
			path: "../../public/fonts/figtree/Figtree-Medium.ttf",
			weight: "500",
			style: "normal",
		},
		{
			path: "../../public/fonts/figtree/Figtree-SemiBold.ttf",
			weight: "600",
			style: "normal",
		},
		{
			path: "../../public/fonts/figtree/Figtree-Bold.ttf",
			weight: "700",
			style: "normal",
		},
		{
			path: "../../public/fonts/figtree/Figtree-ExtraBold.ttf",
			weight: "800",
			style: "normal",
		},
		{
			path: "../../public/fonts/figtree/Figtree-Black.ttf",
			weight: "900",
			style: "normal",
		},
	],
	variable: "--font-figtree",
	display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://agri-market-v1.vercel.app";
const description =
	"AgriMarket connects Nigerian farmers directly with buyers through transparent listings, secure escrow payments, and real-time market information.";

export const metadata: Metadata = {
	title: {
		default: "AgriMarket Nigeria | Direct Farm-to-Buyer Marketplace",
		template: "%s | AgriMarket Nigeria",
	},
	description,
	keywords: [
		"AgriMarket Nigeria",
		"Nigerian farmers marketplace",
		"farm to buyer",
		"buy produce online Nigeria",
		"sell farm produce",
		"agriculture marketplace",
		"escrow payments Nigeria",
		"fresh produce Nigeria",
		"farmer marketplace",
		"agritech Nigeria",
		"market prices Nigeria",
		"wholesale produce Nigeria",
	],
	authors: [{ name: "AgriMarket Nigeria" }],
	creator: "AgriMarket Nigeria",
	metadataBase: new URL(siteUrl),
	openGraph: {
		type: "website",
		locale: "en_NG",
		url: siteUrl,
		siteName: "AgriMarket Nigeria",
		title: "AgriMarket Nigeria | Direct Farm-to-Buyer Marketplace",
		description,
		// The actual share image comes from src/app/opengraph-image.tsx —
		// Next.js generates it and wires it into this metadata automatically,
		// no need to list a file here.
	},
	twitter: {
		card: "summary_large_image",
		title: "AgriMarket Nigeria | Direct Farm-to-Buyer Marketplace",
		description,
		creator: "@agrimarketng", // Replace with your actual X handle, or remove this line
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-image-preview": "large",
		},
	},
	// Tab icon / apple touch icon come from src/app/icon.tsx and
	// src/app/apple-icon.tsx — Next.js generates and wires those in too.
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			data-scroll-behavior="smooth"
			className={`h-full antialiased ${figtree.variable}`}
		>
			<body className="min-h-full flex flex-col font-sans">
				{children}
				<Toaster position="top-right" richColors />
			</body>
		</html>
	);
}
