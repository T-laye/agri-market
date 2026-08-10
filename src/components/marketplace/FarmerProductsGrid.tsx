"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Product } from "@/lib/data/products";
import ProductCard from "./ProductCard";
import ProductModal from "./ProductModal";

export default function FarmerProductsGrid({ products }: { products: Product[] }) {
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

	if (products.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center gap-2 py-16 text-center border border-dashed border-neutral-200 rounded-[15px]">
				<p className="text-neutral-500 font-semibold">No active listings right now</p>
				<p className="text-sm text-neutral-400">Check back soon for fresh produce.</p>
			</div>
		);
	}

	return (
		<>
			<motion.div
				className="grid grid-cols-1 min-[500px]:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
				variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}
				initial="hidden"
				animate="visible"
			>
				{products.map((product) => (
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

			<ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
		</>
	);
}
