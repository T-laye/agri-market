import { ImageResponse } from "next/og";
import fs from "node:fs";
import path from "node:path";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

const fontBold = fs.readFileSync(
	path.join(process.cwd(), "public/fonts/figtree/Figtree-ExtraBold.ttf")
);

export default function Icon() {
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
					borderRadius: 7,
				}}
			>
				<span
					style={{
						fontFamily: "Figtree",
						fontSize: 22,
						fontWeight: 800,
						color: "#ffffc9",
						lineHeight: 1,
						marginTop: 2,
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
