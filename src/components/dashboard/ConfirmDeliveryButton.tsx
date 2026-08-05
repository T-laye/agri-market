"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { confirmOrderItemDelivery } from "@/app/dashboard/orders/actions";

export default function ConfirmDeliveryButton({ itemId }: { itemId: string }) {
	const [isPending, startTransition] = useTransition();
	const router = useRouter();

	function handleClick() {
		startTransition(async () => {
			const result = await confirmOrderItemDelivery(itemId);
			if (result.error) {
				toast.error(result.error);
				return;
			}
			toast.success("Delivery confirmed — thanks for shopping with AgriMarket!");
			router.refresh();
		});
	}

	return (
		<button
			onClick={handleClick}
			disabled={isPending}
			className="rounded-[30px] bg-primary text-white text-xs font-semibold px-4 py-2 hover:bg-primary-600 duration-150 disabled:opacity-50 shrink-0"
		>
			{isPending ? "Confirming…" : "Confirm Delivery"}
		</button>
	);
}
