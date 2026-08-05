import { ImageResponse } from "next/og";
import fs from "node:fs";
import path from "node:path";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "AgriMarket Nigeria — Direct Farm-to-Buyer Marketplace";

const fontsDir = path.join(process.cwd(), "public/fonts/figtree");
const fontRegular = fs.readFileSync(path.join(fontsDir, "Figtree-Regular.ttf"));
const fontBold = fs.readFileSync(path.join(fontsDir, "Figtree-ExtraBold.ttf"));

export default function OpengraphImage() {
	return new ImageResponse(
		(
			<div
				style={{
					width: "100%",
					height: "100%",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					background: "linear-gradient(135deg, #154f00 0%, #061800 100%)",
					padding: 80,
				}}
			>
				<div
					style={{
						display: "flex",
						alignItems: "baseline",
						fontFamily: "Figtree",
						fontWeight: 800,
						fontSize: 96,
					}}
				>
					<span style={{ color: "#ffffff" }}>Agri</span>
					<span style={{ color: "#ffffc9" }}>Market</span>
				</div>
				<div
					style={{
						display: "flex",
						marginTop: 28,
						fontFamily: "Figtree",
						fontWeight: 400,
						fontSize: 34,
						color: "#d0dccc",
						textAlign: "center",
					}}
				>
					Direct farm-to-buyer marketplace for Nigeria
				</div>
			</div>
		),
		{
			...size,
			fonts: [
				{ name: "Figtree", data: fontRegular, weight: 400, style: "normal" },
				{ name: "Figtree", data: fontBold, weight: 800, style: "normal" },
			],
		}
	);
}
