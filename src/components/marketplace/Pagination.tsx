"use client";

import { HiChevronLeft, HiChevronRight } from "react-icons/hi";

export default function Pagination({
	page,
	totalPages,
	onPageChange,
}: {
	page: number;
	totalPages: number;
	onPageChange: (page: number) => void;
}) {
	if (totalPages <= 1) return null;

	const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

	return (
		<div className="flex items-center justify-center gap-2 pt-4">
			<button
				onClick={() => onPageChange(page - 1)}
				disabled={page === 1}
				aria-label="Previous page"
				className="w-9 h-9 flex items-center justify-center rounded-full border border-neutral-200 text-neutral-500 disabled:opacity-40 disabled:cursor-not-allowed hover:border-primary hover:text-primary duration-150"
			>
				<HiChevronLeft />
			</button>

			{pages.map((p) => (
				<button
					key={p}
					onClick={() => onPageChange(p)}
					aria-current={p === page ? "page" : undefined}
					className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-medium duration-150 ${
						p === page
							? "bg-primary text-white"
							: "text-neutral-500 hover:bg-neutral-100"
					}`}
				>
					{p}
				</button>
			))}

			<button
				onClick={() => onPageChange(page + 1)}
				disabled={page === totalPages}
				aria-label="Next page"
				className="w-9 h-9 flex items-center justify-center rounded-full border border-neutral-200 text-neutral-500 disabled:opacity-40 disabled:cursor-not-allowed hover:border-primary hover:text-primary duration-150"
			>
				<HiChevronRight />
			</button>
		</div>
	);
}
