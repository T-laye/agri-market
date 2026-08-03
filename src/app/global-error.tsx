"use client";

export default function GlobalError({
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<html lang="en">
			<body>
				<div
					style={{
						minHeight: "100vh",
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
						gap: "1.5rem",
						textAlign: "center",
						padding: "1.5rem",
						fontFamily: "sans-serif",
					}}
				>
					<h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111" }}>
						Something went wrong
					</h1>
					<p style={{ color: "#666", maxWidth: "24rem" }}>
						AgriMarket hit an unexpected error. Please try again.
					</p>
					<button
						onClick={reset}
						style={{
							background: "#154f00",
							color: "#fff",
							borderRadius: "30px",
							padding: "12px 32px",
							fontWeight: 600,
							border: "none",
							cursor: "pointer",
						}}
					>
						Try Again
					</button>
				</div>
			</body>
		</html>
	);
}
