"use client";

import { useMemo, useState } from "react";
import { HiOutlineSearch, HiOutlineX } from "react-icons/hi";
import { motion } from "framer-motion";
import type { PublicFarmer } from "@/lib/data/publicFarmers";
import FarmerCard from "./FarmerCard";

export default function FarmersView({
	farmers,
	favoriteIds,
}: {
	farmers: PublicFarmer[];
	favoriteIds: string[];
}) {
	const [search, setSearch] = useState("");
	const favoriteSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);

	const filtered = useMemo(() => {
		const query = search.trim().toLowerCase();
		const result =
			query.length === 0
				? farmers
				: farmers.filter(
						(f) =>
							f.farmName.toLowerCase().includes(query) ||
							f.state.toLowerCase().includes(query)
					);

		// Favorited farmers first, then alphabetical within each group.
		return [...result].sort((a, b) => {
			const aFav = favoriteSet.has(a.id);
			const bFav = favoriteSet.has(b.id);
			if (aFav !== bFav) return aFav ? -1 : 1;
			return a.farmName.localeCompare(b.farmName);
		});
	}, [farmers, search, favoriteSet]);

	return (
		<div className="flex flex-col gap-6">
			<div className="relative max-w-md">
				<HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 text-lg pointer-events-none" />
				<input
					type="text"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					placeholder="Search farmers or state…"
					className="input-class pl-10.5"
				/>
				{search && (
					<button
						onClick={() => setSearch("")}
						aria-label="Clear search"
						className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-500"
					>
						<HiOutlineX />
					</button>
				)}
			</div>

			<p className="text-sm text-neutral-400">
				{filtered.length} {filtered.length === 1 ? "farmer" : "farmers"} found
			</p>

			{filtered.length === 0 ? (
				<div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
					{farmers.length === 0 ? (
						<>
							<p className="text-neutral-500 font-semibold">No verified farmers yet</p>
							<p className="text-sm text-neutral-400">Check back soon.</p>
						</>
					) : (
						<>
							<p className="text-neutral-500 font-semibold">No farmers match your search</p>
							<p className="text-sm text-neutral-400">Try a different name or state.</p>
						</>
					)}
				</div>
			) : (
				<motion.div
					className="grid grid-cols-1 md:grid-cols-2 gap-4"
					variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.04 } } }}
					initial="hidden"
					animate="visible"
				>
					{filtered.map((farmer) => (
						<motion.div
							key={farmer.id}
							variants={{
								hidden: { opacity: 0, y: 12 },
								visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
							}}
						>
							<FarmerCard farmer={farmer} favorited={favoriteSet.has(farmer.id)} />
						</motion.div>
					))}
				</motion.div>
			)}
		</div>
	);
}
