"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { advanceOrderItem, cancelOrderItem } from "@/app/dashboard/orders/actions";
import { FARMER_STATUS_SEQUENCE, type OrderItemStatus } from "@/lib/data/orders";

const NEXT_LABEL: Record<string, string> = {
	accepted: "Accept Order",
	preparing: "Mark as Preparing",
	in_transit: "Mark as In Transit",
	delivered: "Mark as Delivered",
};

export default function FarmerOrderItemActions({
	itemId,
	status,
	onActionComplete,
}: {
	itemId: string;
	status: OrderItemStatus;
	/** Called after a successful advance/cancel — e.g. so a parent modal
	 * showing this item's (now stale) status can close itself. */
	onActionComplete?: () => void;
}) {
	const [isPending, startTransition] = useTransition();
	const router = useRouter();

	const currentIndex = FARMER_STATUS_SEQUENCE.indexOf(status);
	const nextStatus = currentIndex >= 0 ? FARMER_STATUS_SEQUENCE[currentIndex + 1] : undefined;
	const canCancel = currentIndex >= 0 && status !== "delivered";

	function handleAdvance() {
		startTransition(async () => {
			const result = await advanceOrderItem(itemId);
			if (result.error) {
				toast.error(result.error);
				return;
			}
			toast.success("Order updated");
			router.refresh();
			onActionComplete?.();
		});
	}

	function handleCancel() {
		if (!window.confirm("Cancel this order item? This can't be undone.")) return;
		startTransition(async () => {
			const result = await cancelOrderItem(itemId);
			if (result.error) {
				toast.error(result.error);
				return;
			}
			toast.success("Order item cancelled");
			router.refresh();
			onActionComplete?.();
		});
	}

	if (!nextStatus) {
		return null;
	}

	return (
		<div className="flex flex-wrap items-center gap-2 sm:gap-3">
			{canCancel && (
				<button
					onClick={handleCancel}
					disabled={isPending}
					className="text-xs text-neutral-400 hover:text-red-500 duration-150 disabled:opacity-50"
				>
					Cancel
				</button>
			)}
			<button
				onClick={handleAdvance}
				disabled={isPending}
				className="rounded-[30px] bg-primary text-white text-xs font-semibold px-4 py-2 hover:bg-primary-600 duration-150 disabled:opacity-50"
			>
				{isPending ? "Updating…" : NEXT_LABEL[nextStatus] ?? "Advance"}
			</button>
		</div>
	);
}
