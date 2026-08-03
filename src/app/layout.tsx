import type { Metadata } from "next";
import localFont from "next/font/local";
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

export const metadata: Metadata = {
  title: "AgriMarket Nigeria | Direct Farm-to-Buyer Marketplace",
  description:
    "AgriMarket connects Nigerian farmers directly with buyers through transparent listings, secure escrow payments, and real-time market information.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`h-full antialiased ${figtree.variable}`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
