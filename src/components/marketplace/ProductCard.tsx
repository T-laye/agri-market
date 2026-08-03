"use client";

import Image from "next/image";
import { toast } from "sonner";
import { HiOutlineLocationMarker, HiStar, HiOutlineBadgeCheck } from "react-icons/hi";
import { HiOutlineShoppingCart } from "react-icons/hi2";
import type { Product } from "@/lib/data/products";
import { useCartStore } from "@/store/cart";

function formatNaira(amount: number) {
	return new Intl.NumberFormat("en-NG", {
		style: "currency",
		currency: "NGN",
		maximumFractionDigits: 0,
	}).format(amount);
}

export default function ProductCard({
	product,
	onSelect,
}: {
	product: Product;
	onSelect?: (product: Product) => void;
}) {
	const addItem = useCartStore((state) => state.addItem);

	function handleAddToCart(e: React.MouseEvent) {
		e.stopPropagation();
		addItem(product);
		toast.success(`${product.name} added to cart`);
	}

	return (
		<div
			onClick={() => onSelect?.(product)}
			className="flex flex-col rounded-[15px] overflow-hidden border border-neutral-200 bg-white group cursor-pointer"
		>
			<div className="relative aspect-4/3 overflow-hidden">
				<Image
					src={product.image}
					alt={product.name}
					fill
					sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
					quality={85}
					className="object-cover duration-300 group-hover:scale-105"
				/>
				<span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-primary text-xs font-semibold rounded-[30px] px-3 py-1">
					{product.category}
				</span>
			</div>

			<div className="flex flex-col gap-2 p-4">
				<div className="flex items-start justify-between gap-2">
					<h3 className="font-bold text-base text-neutral-500 leading-5">
						{product.name}
					</h3>
					<span className="flex items-center gap-1 text-xs font-semibold text-secondary-700 shrink-0">
						<HiStar className="text-secondary-500" />
						{product.rating.toFixed(1)}
					</span>
				</div>

				<div className="flex items-center gap-1.5 text-xs text-neutral-400">
					<span className="truncate">{product.farmerName}</span>
					{product.farmerVerified && (
						<HiOutlineBadgeCheck className="text-primary text-sm shrink-0" />
					)}
				</div>

				<div className="flex items-center gap-1 text-xs text-neutral-400">
					<HiOutlineLocationMarker className="shrink-0" />
					{product.location} State
				</div>

				<div className="flex items-center justify-between mt-2">
					<div className="flex flex-col">
						<span className="font-bold text-primary text-base leading-5">
							{formatNaira(product.price)}
						</span>
						<span className="text-xs text-neutral-400">{product.unit}</span>
					</div>

					<button
						onClick={handleAddToCart}
						aria-label={`Add ${product.name} to cart`}
						className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-white hover:bg-primary-600 hover:scale-105 duration-150"
					>
						<HiOutlineShoppingCart className="text-lg" />
					</button>
				</div>
			</div>
		</div>
	);
}
