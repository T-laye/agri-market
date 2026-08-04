"use client";

import { useMemo, useState } from "react";
import {
	HiOutlineSearch,
	HiOutlineX,
	HiOutlineLocationMarker,
	HiOutlineSwitchVertical,
} from "react-icons/hi";
import { motion } from "framer-motion";
import { categories, locations, type Product } from "@/lib/data/products";
import ProductCard from "./ProductCard";
import ProductModal from "./ProductModal";
import Pagination from "./Pagination";

const ITEMS_PER_PAGE = 8;

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
			return sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
		default:
			return sorted;
	}
}

export default function MarketplaceView({ products }: { products: Product[] }) {
	const [search, setSearch] = useState("");
	const [category, setCategory] = useState<string>("All");
	const [location, setLocation] = useState<string>("All");
	const [sort, setSort] = useState<SortOption>("featured");
	const [page, setPage] = useState(1);
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

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

	const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
	const paginated = filtered.slice(
		(page - 1) * ITEMS_PER_PAGE,
		page * ITEMS_PER_PAGE
	);

	const hasActiveFilters = search !== "" || category !== "All" || location !== "All";

	function updateFilter(fn: () => void) {
		fn();
		setPage(1);
	}

	function clearFilters() {
		updateFilter(() => {
			setSearch("");
			setCategory("All");
			setLocation("All");
		});
	}

	function handlePageChange(newPage: number) {
		setPage(newPage);
		window.scrollTo({ top: 0, behavior: "smooth" });
	}

	return (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col md:flex-row gap-3 md:items-center">
				<div className="relative flex-1 min-w-0">
					<HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 text-lg pointer-events-none" />
					<input
						type="text"
						value={search}
						onChange={(e) => updateFilter(() => setSearch(e.target.value))}
						placeholder="Search produce or farmer…"
						className="input-class pl-10.5"
					/>
				</div>

				<div className="relative w-full md:w-46 lg:w-52 shrink-0">
					<HiOutlineLocationMarker className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 text-lg pointer-events-none" />
					<select
						value={location}
						onChange={(e) => updateFilter(() => setLocation(e.target.value))}
						className="select-class pl-10.5"
					>
						<option value="All">All Locations</option>
						{locations.map((loc) => (
							<option key={loc} value={loc}>
								{loc} State
							</option>
						))}
					</select>
				</div>

				<div className="relative w-full md:w-52 lg:w-56 shrink-0">
					<HiOutlineSwitchVertical className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 text-lg pointer-events-none" />
					<select
						value={sort}
						onChange={(e) => setSort(e.target.value as SortOption)}
						className="select-class pl-10.5"
					>
						{sortOptions.map((opt) => (
							<option key={opt.value} value={opt.value}>
								{opt.label}
							</option>
						))}
					</select>
				</div>
			</div>

			<div className="flex items-center gap-2 flex-wrap">
				{["All", ...categories].map((cat) => (
					<button
						key={cat}
						onClick={() => updateFilter(() => setCategory(cat))}
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
					{products.length === 0 ? (
						<>
							<p className="text-neutral-500 font-semibold">No produce listed yet</p>
							<p className="text-sm text-neutral-400">
								Check back soon as verified farmers add their harvest.
							</p>
						</>
					) : (
						<>
							<p className="text-neutral-500 font-semibold">No produce matches your search</p>
							<p className="text-sm text-neutral-400">Try adjusting your filters.</p>
						</>
					)}
				</div>
			) : (
				<>
					<motion.div
						key={page}
						className="grid grid-cols-1 min-[500px]:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
						variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
						initial="hidden"
						animate="visible"
					>
						{paginated.map((product) => (
							<motion.div
								key={product.id}
								variants={{
									hidden: { opacity: 0, y: 15 },
									visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
								}}
							>
								<ProductCard product={product} onSelect={setSelectedProduct} />
							</motion.div>
						))}
					</motion.div>

					<Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
				</>
			)}

			<ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
		</div>
	);
}
