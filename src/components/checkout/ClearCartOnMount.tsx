"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/cart";

export default function ClearCartOnMount({ paid }: { paid: boolean }) {
	useEffect(() => {
		if (paid) {
			useCartStore.getState().clearCart();
		}
	}, [paid]);

	return null;
}
