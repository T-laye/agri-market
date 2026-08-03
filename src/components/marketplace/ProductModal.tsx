"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
	HiX,
	HiOutlineLocationMarker,
	HiStar,
	HiOutlineBadgeCheck,
} from "react-icons/hi";
import { HiOutlineShoppingCart } from "react-icons/hi2";
import type { Product } from "@/lib/data/products";
import { useCartStore } from "@/store/cart";
import Button from "@/components/ui/Button";

function formatNaira(amount: number) {
	return new Intl.NumberFormat("en-NG", {
		style: "currency",
		currency: "NGN",
		maximumFractionDigits: 0,
	}).format(amount);
}

export default function ProductModal({
	product,
	onClose,
}: {
	product: Product | null;
	onClose: () => void;
}) {
	const [activeImage, setActiveImage] = useState(0);
	const addItem = useCartStore((state) => state.addItem);

	useEffect(() => {
		setActiveImage(0);
	}, [product]);

	useEffect(() => {
		function handleKey(e: KeyboardEvent) {
			if (e.key === "Escape") onClose();
		}
		document.addEventListener("keydown", handleKey);
		return () => document.removeEventListener("keydown", handleKey);
	}, [onClose]);

	function handleAddToCart() {
		if (!product) return;
		addItem(product);
		toast.success(`${product.name} added to cart`);
	}

	return (
		<AnimatePresence>
			{product && (
				<>
					<motion.div
						className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={onClose}
					/>
					<motion.div
						className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
					>
						<motion.div
							className="pointer-events-auto bg-white rounded-[15px] overflow-hidden w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col md:flex-row"
							initial={{ opacity: 0, scale: 0.95, y: 20 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: 20 }}
							transition={{ duration: 0.25, ease: "easeOut" }}
							onClick={(e) => e.stopPropagation()}
						>
							<button
								aria-label="Close"
								onClick={onClose}
								className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white/90 text-neutral-500 hover:bg-white shadow"
							>
								<HiX className="text-lg" />
							</button>

							<div className="md:w-1/2 flex flex-col">
								<div className="relative aspect-4/3 md:aspect-auto md:h-full min-h-64">
									<Image
										src={product.images[activeImage] ?? product.image}
										alt={product.name}
										fill
										sizes="(min-width: 768px) 50vw, 100vw"
										quality={85}
										className="object-cover"
									/>
								</div>
								{product.images.length > 1 && (
									<div className="flex gap-2 p-3">
										{product.images.map((img, i) => (
											<button
												key={img + i}
												onClick={() => setActiveImage(i)}
												className={`relative w-16 h-16 rounded-[8px] overflow-hidden border-2 shrink-0 duration-150 ${
													activeImage === i
														? "border-primary"
														: "border-transparent opacity-70 hover:opacity-100"
												}`}
											>
												<Image
													src={img}
													alt={`${product.name} ${i + 1}`}
													fill
													sizes="64px"
													className="object-cover"
												/>
											</button>
										))}
									</div>
								)}
							</div>

							<div className="md:w-1/2 flex flex-col gap-4 p-6">
								<span className="bg-secondary-100 text-secondary-700 rounded-[30px] px-4 py-1 text-xs font-semibold w-fit">
									{product.category}
								</span>

								<div className="flex items-start justify-between gap-3">
									<h2 className="font-bold text-2xl md:text-3xl text-neutral-500">
										{product.name}
									</h2>
									<span className="flex items-center gap-1 text-sm font-semibold text-secondary-700 shrink-0 mt-1">
										<HiStar className="text-secondary-500" />
										{product.rating.toFixed(1)}
									</span>
								</div>

								<p className="text-sm text-neutral-400 leading-6">
									{product.description}
								</p>

								<div className="flex flex-col gap-1 py-3 border-y border-neutral-200">
									<span className="font-bold text-primary text-2xl">
										{formatNaira(product.price)}
									</span>
									<span className="text-sm text-neutral-400">{product.unit}</span>
								</div>

								<div className="flex flex-col gap-2">
									<div className="flex items-center gap-2">
										<span className="text-sm font-semibold text-neutral-500">
											{product.farmerName}
										</span>
										{product.farmerVerified && (
											<span className="flex items-center gap-1 text-xs text-primary">
												<HiOutlineBadgeCheck />
												Verified Farmer
											</span>
										)}
									</div>

									<div className="flex items-start gap-2 text-sm text-neutral-400">
										<HiOutlineLocationMarker className="mt-0.5 shrink-0" />
										<div className="flex flex-col">
											<span className="font-medium text-neutral-500">
												{product.location} State
											</span>
											<span>{product.address}</span>
										</div>
									</div>
								</div>

								<Button
									variant="primary"
									className="w-full mt-2"
									onClick={handleAddToCart}
								>
									<HiOutlineShoppingCart className="mr-2 text-lg" />
									Add to Cart
								</Button>
							</div>
						</motion.div>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
}
