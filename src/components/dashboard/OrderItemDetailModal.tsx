"use client";

import { useEffect } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
	HiX,
	HiOutlineLocationMarker,
	HiOutlineCalendar,
	HiOutlineCash,
} from "react-icons/hi";
import type { FarmerOrderItem } from "@/lib/data/orders";
import OrderItemStatusBadge from "./OrderItemStatusBadge";
import FarmerOrderItemActions from "./FarmerOrderItemActions";
import CallButton from "./CallButton";

function formatNaira(amount: number) {
	return new Intl.NumberFormat("en-NG", {
		style: "currency",
		currency: "NGN",
		maximumFractionDigits: 0,
	}).format(amount);
}

const PAYOUT_LABEL: Record<string, string> = {
	paid: "Paid Out",
	processing: "Processing",
	pending: "Awaiting Payout",
	failed: "Payout Failed",
	not_applicable: "—",
};

export default function OrderItemDetailModal({
	item,
	onClose,
}: {
	item: FarmerOrderItem | null;
	onClose: () => void;
}) {
	useEffect(() => {
		function handleKey(e: KeyboardEvent) {
			if (e.key === "Escape") onClose();
		}
		document.addEventListener("keydown", handleKey);
		return () => document.removeEventListener("keydown", handleKey);
	}, [onClose]);

	const contactRevealed = item ? item.status !== "pending" && item.status !== "cancelled" : false;

	const fullAddress = item
		? [item.order.deliveryAddress, item.order.deliveryCity, `${item.order.deliveryState} State`]
				.filter(Boolean)
				.join(", ")
		: "";

	return (
		<AnimatePresence>
			{item && (
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
							className="pointer-events-auto bg-white rounded-[15px] overflow-hidden w-full max-w-lg max-h-[90vh] overflow-y-auto"
							initial={{ opacity: 0, scale: 0.95, y: 20 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: 20 }}
							transition={{ duration: 0.25, ease: "easeOut" }}
							onClick={(e) => e.stopPropagation()}
						>
							<div className="flex items-center justify-between gap-3 p-5 border-b border-neutral-100">
								<h2 className="font-bold text-lg text-neutral-500">Order Details</h2>
								<button
									aria-label="Close"
									onClick={onClose}
									className="w-9 h-9 flex items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-500 shrink-0"
								>
									<HiX className="text-lg" />
								</button>
							</div>

							<div className="flex flex-col gap-5 p-5">
								<div className="flex items-center gap-4">
									{item.productImage && (
										<div className="relative w-16 h-16 rounded-[10px] overflow-hidden shrink-0 bg-neutral-100">
											<Image
												src={item.productImage}
												alt={item.productName}
												fill
												sizes="64px"
												className="object-cover"
												unoptimized
											/>
										</div>
									)}
									<div className="min-w-0 flex-1">
										<p className="font-semibold text-neutral-500">{item.productName}</p>
										<p className="text-sm text-neutral-400">
											{item.quantity} {item.unit} × {formatNaira(item.unitPrice)}
										</p>
									</div>
									<OrderItemStatusBadge status={item.status} />
								</div>

								<div className="grid grid-cols-2 gap-4 text-sm">
									<div className="flex items-start gap-2">
										<HiOutlineCalendar className="text-neutral-400 mt-0.5 shrink-0" />
										<div>
											<p className="text-xs text-neutral-400">Order #{item.order.id.slice(0, 8)}</p>
											<p className="text-neutral-500 font-medium">
												{new Date(item.order.createdAt).toLocaleString("en-NG", {
													dateStyle: "medium",
													timeStyle: "short",
												})}
											</p>
										</div>
									</div>
									<div className="flex items-start gap-2">
										<HiOutlineCash className="text-neutral-400 mt-0.5 shrink-0" />
										<div>
											<p className="text-xs text-neutral-400">Payment</p>
											<p className="text-neutral-500 font-medium capitalize">
												{item.order.paymentStatus}
											</p>
										</div>
									</div>
								</div>

								<div className="flex flex-col gap-2 border-t border-neutral-100 pt-4">
									<h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
										Delivery Address
									</h3>
									<div className="flex items-start gap-2 text-sm text-neutral-500">
										<HiOutlineLocationMarker className="text-neutral-400 mt-0.5 shrink-0" />
										<div>
											<p>{fullAddress}</p>
											{item.order.deliveryLandmark && (
												<p className="text-neutral-400">
													Landmark: {item.order.deliveryLandmark}
												</p>
											)}
										</div>
									</div>
								</div>

								<div className="flex flex-col gap-2 border-t border-neutral-100 pt-4">
									<h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
										Buyer Contact
									</h3>
									{contactRevealed && item.order.contactPhone ? (
										<div className="flex items-center justify-between gap-3">
											<span className="text-sm text-neutral-500">
												{item.order.contactPhone}
											</span>
											<CallButton phone={item.order.contactPhone} label="Call Buyer" />
										</div>
									) : (
										<p className="text-sm text-neutral-400">
											{item.status === "pending"
												? "Revealed once you accept this order."
												: "No contact number on file for this order."}
										</p>
									)}
								</div>

								{item.status === "completed" && (
									<div className="flex flex-col gap-2 border-t border-neutral-100 pt-4">
										<h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
											Payout
										</h3>
										<div className="flex items-center justify-between text-sm">
											<span className="text-neutral-400">
												{PAYOUT_LABEL[item.payoutStatus] ?? item.payoutStatus}
											</span>
											<span className="font-semibold text-neutral-500">
												{formatNaira(item.payoutAmount ?? item.unitPrice * item.quantity)}
											</span>
										</div>
									</div>
								)}

								<div className="border-t border-neutral-100 pt-4">
									<FarmerOrderItemActions
										itemId={item.id}
										status={item.status}
										onActionComplete={onClose}
									/>
								</div>
							</div>
						</motion.div>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
}
