import Link from "next/link";

export default function Logo({ light = false }: { light?: boolean }) {
	return (
		<Link
			href="/"
			className="text-xl md:text-2xl font-extrabold tracking-tight whitespace-nowrap"
		>
			<span className={light ? "text-white" : "text-primary"}>Agri</span>
			<span className={light ? "text-accent-500" : "text-secondary-500"}>
				Market
			</span>
		</Link>
	);
}
