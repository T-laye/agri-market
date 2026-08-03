export default function Loading() {
	return (
		<div className="flex flex-1 flex-col items-center justify-center min-h-screen gap-4">
			<span className="w-10 h-10 rounded-full border-4 border-primary-100 border-t-primary animate-spin" />
			<p className="text-sm text-neutral-400">Loading…</p>
		</div>
	);
}
