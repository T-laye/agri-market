"use client";

import { useMemo, useState } from "react";
import { HiOutlineSearch, HiOutlineX } from "react-icons/hi";
import { motion } from "framer-motion";
import {
	categories,
	locations,
	products,
	type Product,
} from "@/lib/data/products";
import ProductCard from "./ProductCard";

type SortOption = "featured" | "price-asc" | "price-desc" | "rating";

const sortOptions: { value: SortOption; label: string }[] = [
	{ value: "featured", label: "Featured" },
	{ value: "price-asc", label: "Price: Low to High" },
	{ value: "price-desc", label: "Price: High to Low" },
	{ value: "rating", label: "Highest Rated" },
];

function sortProducts(list: Product[], sort: SortOption) {
	const sorted = [...list];
	switch (sort) {
		case "price-asc":
			return sorted.sort((a, b) => a.price - b.price);
		case "price-desc":
			return sorted.sort((a, b) => b.price - a.price);
		case "rating":
			return sorted.sort((a, b) => b.rating - a.rating);
		default:
			return sorted;
	}
}

export default function MarketplaceView() {
	const [search, setSearch] = useState("");
	const [category, setCategory] = useState<string>("All");
	const [location, setLocation] = useState<string>("All");
	const [sort, setSort] = useState<SortOption>("featured");

	const filtered = useMemo(() => {
		const query = search.trim().toLowerCase();

		const result = products.filter((product) => {
			const matchesQuery =
				query.length === 0 ||
				product.name.toLowerCase().includes(query) ||
				product.farmerName.toLowerCase().includes(query);
			const matchesCategory = category === "All" || product.category === category;
			const matchesLocation = location === "All" || product.location === location;

			return matchesQuery && matchesCategory && matchesLocation;
		});

		return sortProducts(result, sort);
	}, [search, category, location, sort]);

	const hasActiveFilters = search !== "" || category !== "All" || location !== "All";

	function clearFilters() {
		setSearch("");
		setCategory("All");
		setLocation("All");
	}

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col md:flex-row gap-3 md:items-center">
				<div className="relative flex-1">
					<HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 text-lg" />
					<input
						type="text"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search produce or farmer…"
						className="input-class pl-10.5"
					/>
				</div>

				<select
					value={location}
					onChange={(e) => setLocation(e.target.value)}
					className="select-class w-full md:w-48"
				>
					<option value="All">All Locations</option>
					{locations.map((loc) => (
						<option key={loc} value={loc}>
							{loc} State
						</option>
					))}
				</select>

				<select
					value={sort}
					onChange={(e) => setSort(e.target.value as SortOption)}
					className="select-class w-full md:w-56"
				>
					{sortOptions.map((opt) => (
						<option key={opt.value} value={opt.value}>
							{opt.label}
						</option>
					))}
				</select>
			</div>

			<div className="flex items-center gap-2 flex-wrap">
				{["All", ...categories].map((cat) => (
					<button
						key={cat}
						onClick={() => setCategory(cat)}
						className={`rounded-[30px] px-4 py-2 text-sm font-medium duration-150 ${
							category === cat
								? "bg-primary text-white"
								: "bg-neutral-100 text-neutral-400 hover:bg-primary-100 hover:text-primary"
						}`}
					>
						{cat}
					</button>
				))}

				{hasActiveFilters && (
					<button
						onClick={clearFilters}
						className="flex items-center gap-1 text-sm text-neutral-400 hover:text-red-500 duration-150 ml-1"
					>
						<HiOutlineX />
						Clear filters
					</button>
				)}
			</div>

			<p className="text-sm text-neutral-400">
				{filtered.length} {filtered.length === 1 ? "product" : "products"} found
			</p>

			{filtered.length === 0 ? (
				<div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
					<p className="text-neutral-500 font-semibold">No produce matches your search</p>
					<p className="text-sm text-neutral-400">Try adjusting your filters.</p>
				</div>
			) : (
				<motion.div
					className="grid grid-cols-1 min-[500px]:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
					variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
					initial="hidden"
					animate="visible"
				>
					{filtered.map((product) => (
						<motion.div
							key={product.id}
							variants={{
								hidden: { opacity: 0, y: 15 },
								visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
							}}
						>
							<ProductCard product={product} />
						</motion.div>
					))}
				</motion.div>
			)}
		</div>
	);
}
