import { ImageResponse } from "next/og";
import fs from "node:fs";
import path from "node:path";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const fontBold = fs.readFileSync(
	path.join(process.cwd(), "public/fonts/figtree/Figtree-ExtraBold.ttf")
);

export default function AppleIcon() {
	return new ImageResponse(
		(
			<div
				style={{
					width: "100%",
					height: "100%",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					background: "#154f00",
				}}
			>
				<span
					style={{
						fontFamily: "Figtree",
						fontSize: 120,
						fontWeight: 800,
						color: "#ffffc9",
						lineHeight: 1,
						marginTop: 10,
					}}
				>
					A
				</span>
			</div>
		),
		{
			...size,
			fonts: [{ name: "Figtree", data: fontBold, weight: 800, style: "normal" }],
		}
	);
}
