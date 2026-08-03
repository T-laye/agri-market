import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/lib/data/products";

export type CartItem = {
	productId: string;
	name: string;
	price: number;
	unit: string;
	image: string;
	farmerName: string;
	quantity: number;
};

type CartState = {
	items: CartItem[];
	addItem: (product: Product, quantity?: number) => void;
	removeItem: (productId: string) => void;
	updateQuantity: (productId: string, quantity: number) => void;
	clearCart: () => void;
};

export const useCartStore = create<CartState>()(
	persist(
		(set) => ({
			items: [],

			addItem: (product, quantity = 1) =>
				set((state) => {
					const existing = state.items.find(
						(item) => item.productId === product.id
					);

					if (existing) {
						return {
							items: state.items.map((item) =>
								item.productId === product.id
									? { ...item, quantity: item.quantity + quantity }
									: item
							),
						};
					}

					return {
						items: [
							...state.items,
							{
								productId: product.id,
								name: product.name,
								price: product.price,
								unit: product.unit,
								image: product.image,
								farmerName: product.farmerName,
								quantity,
							},
						],
					};
				}),

			removeItem: (productId) =>
				set((state) => ({
					items: state.items.filter((item) => item.productId !== productId),
				})),

			updateQuantity: (productId, quantity) =>
				set((state) => ({
					items:
						quantity <= 0
							? state.items.filter((item) => item.productId !== productId)
							: state.items.map((item) =>
									item.productId === productId ? { ...item, quantity } : item
								),
				})),

			clearCart: () => set({ items: [] }),
		}),
		{ name: "agrimarket-cart" }
	)
);

export const selectTotalItems = (state: CartState) =>
	state.items.reduce((sum, item) => sum + item.quantity, 0);

export const selectTotalPrice = (state: CartState) =>
	state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
