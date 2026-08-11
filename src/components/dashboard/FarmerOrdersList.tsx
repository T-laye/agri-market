"use client";

import { useState } from "react";
import Image from "next/image";
import type { FarmerOrderItem } from "@/lib/data/orders";
import OrderItemStatusBadge from "./OrderItemStatusBadge";
import FarmerOrderItemActions from "./FarmerOrderItemActions";
import CallButton from "./CallButton";
import OrderItemDetailModal from "./OrderItemDetailModal";

function formatNaira(amount: number) {
	return new Intl.NumberFormat("en-NG", {
		style: "currency",
		currency: "NGN",
		maximumFractionDigits: 0,
	}).format(amount);
}

export default function FarmerOrdersList({ items }: { items: FarmerOrderItem[] }) {
	const [selected, setSelected] = useState<FarmerOrderItem | null>(null);

	return (
		<>
			<div className="flex flex-col divide-y divide-neutral-200 border border-neutral-200 rounded-[15px] overflow-hidden">
				{items.map((item) => {
					// Contacts are only revealed once this item has actually been
					// engaged with — not while it's still sitting unaccepted, and
					// not once it's been cancelled.
					const contactRevealed = item.status !== "pending" && item.status !== "cancelled";

					return (
						<div
							key={item.id}
							onClick={() => setSelected(item)}
							className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4 p-4 cursor-pointer duration-150 hover:bg-neutral-100/60"
						>
							<div className="flex items-center gap-4 flex-1 min-w-0">
								{item.productImage && (
									<div className="relative w-14 h-14 rounded-[10px] overflow-hidden shrink-0 bg-neutral-100">
										<Image
											src={item.productImage}
											alt={item.productName}
											fill
											sizes="56px"
											className="object-cover"
											unoptimized
										/>
									</div>
								)}
								<div className="min-w-0">
									<p className="font-semibold text-sm text-neutral-500 truncate">
										{item.productName}
									</p>
									<p className="text-xs text-neutral-400">
										{item.quantity} × {formatNaira(item.unitPrice)} · Order #
										{item.order.id.slice(0, 8)}
									</p>
									<p className="text-xs text-neutral-400 truncate">
										Deliver to: {item.order.deliveryAddress}, {item.order.deliveryState} State
									</p>
								</div>
							</div>

							{/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
							<div
								className="flex flex-wrap items-center gap-2 lg:justify-end"
								onClick={(e) => e.stopPropagation()}
							>
								<OrderItemStatusBadge status={item.status} />
								{contactRevealed && item.order.contactPhone && (
									<CallButton phone={item.order.contactPhone} label="Call Buyer" />
								)}
								<FarmerOrderItemActions itemId={item.id} status={item.status} />
							</div>
						</div>
					);
				})}
			</div>

			<OrderItemDetailModal item={selected} onClose={() => setSelected(null)} />
		</>
	);
}
