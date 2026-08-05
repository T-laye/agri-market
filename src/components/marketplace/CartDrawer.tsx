"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { HiX, HiOutlineMinus, HiOutlinePlus, HiOutlineTrash } from "react-icons/hi";
import { useCartStore, selectTotalPrice } from "@/store/cart";
import { useUser } from "@/hooks/useUser";
import { pageRoutes } from "@/lib/routes";
import Button from "@/components/ui/Button";

function formatNaira(amount: number) {
	return new Intl.NumberFormat("en-NG", {
		style: "currency",
		currency: "NGN",
		maximumFractionDigits: 0,
	}).format(amount);
}

export default function CartDrawer({
	open,
	onClose,
}: {
	open: boolean;
	onClose: () => void;
}) {
	const router = useRouter();
	const { user } = useUser();
	const items = useCartStore((state) => state.items);
	const updateQuantity = useCartStore((state) => state.updateQuantity);
	const removeItem = useCartStore((state) => state.removeItem);
	const totalPrice = useCartStore(selectTotalPrice);

	function handleCheckout() {
		onClose();

		if (!user) {
			toast.info("Please sign up or log in to check out");
			router.push(`${pageRoutes.auth.signup}?redirect=${pageRoutes.checkout}`);
			return;
		}

		router.push(pageRoutes.checkout);
	}

	return (
		<AnimatePresence>
			{open && (
				<>
					<motion.div
						className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={onClose}
					/>
					<motion.div
						className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col"
						initial={{ x: "100%" }}
						animate={{ x: 0 }}
						exit={{ x: "100%" }}
						transition={{ type: "spring", damping: 28, stiffness: 220 }}
					>
						<div className="flex items-center justify-between px-6 py-5 border-b border-neutral-200">
							<h2 className="font-bold text-lg text-neutral-500">
								Your Cart {items.length > 0 && `(${items.length})`}
							</h2>
							<button
								aria-label="Close cart"
								onClick={onClose}
								className="text-2xl text-neutral-400 hover:text-neutral-500"
							>
								<HiX />
							</button>
						</div>

						{items.length === 0 ? (
							<div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 text-center">
								<p className="text-neutral-400 text-sm">Your cart is empty.</p>
								<Button
									variant="primary"
									className="min-w-0"
									onClick={onClose}
								>
									Continue Browsing
								</Button>
							</div>
						) : (
							<>
								<div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-5">
									{items.map((item) => (
										<div key={item.productId} className="flex gap-3">
											<div className="relative w-18 h-18 rounded-[10px] overflow-hidden shrink-0">
												<Image
													src={item.image}
													alt={item.name}
													fill
													sizes="72px"
													className="object-cover"
												/>
											</div>

											<div className="flex-1 flex flex-col gap-1 min-w-0">
												<span className="text-sm font-semibold text-neutral-500 truncate">
													{item.name}
												</span>
												<span className="text-xs text-neutral-400">
													{formatNaira(item.price)} · {item.unit}
												</span>

												<div className="flex items-center gap-2 mt-1">
													<button
														aria-label="Decrease quantity"
														onClick={() =>
															updateQuantity(item.productId, item.quantity - 1)
														}
														className="w-6 h-6 flex items-center justify-center rounded-full border border-neutral-200 text-neutral-400 hover:border-primary hover:text-primary"
													>
														<HiOutlineMinus className="text-xs" />
													</button>
													<span className="text-sm font-medium w-5 text-center">
														{item.quantity}
													</span>
													<button
														aria-label="Increase quantity"
														onClick={() =>
															updateQuantity(item.productId, item.quantity + 1)
														}
														className="w-6 h-6 flex items-center justify-center rounded-full border border-neutral-200 text-neutral-400 hover:border-primary hover:text-primary"
													>
														<HiOutlinePlus className="text-xs" />
													</button>
												</div>
											</div>

											<button
												aria-label={`Remove ${item.name}`}
												onClick={() => {
													removeItem(item.productId);
													toast(`${item.name} removed from cart`);
												}}
												className="text-neutral-300 hover:text-red-500 self-start"
											>
												<HiOutlineTrash className="text-lg" />
											</button>
										</div>
									))}
								</div>

								<div className="border-t border-neutral-200 px-6 py-5 flex flex-col gap-4">
									<div className="flex items-center justify-between">
										<span className="text-sm text-neutral-400">Subtotal</span>
										<span className="font-bold text-lg text-neutral-500">
											{formatNaira(totalPrice)}
										</span>
									</div>
									<Button variant="primary" className="w-full" onClick={handleCheckout}>
										Checkout
									</Button>
								</div>
							</>
						)}
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
}
