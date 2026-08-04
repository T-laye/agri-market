"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { HiOutlinePencil, HiOutlineTrash, HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";
import { deleteProduct, toggleProductActive } from "@/app/dashboard/products/actions";
import { pageRoutes } from "@/lib/routes";

export default function ProductRowActions({
	productId,
	isActive,
}: {
	productId: string;
	isActive: boolean;
}) {
	const [isPending, startTransition] = useTransition();
	const router = useRouter();

	function handleDelete() {
		if (!window.confirm("Delete this product? This can't be undone.")) return;
		startTransition(async () => {
			await deleteProduct(productId);
			toast.success("Product deleted");
			router.refresh();
		});
	}

	function handleToggle() {
		startTransition(async () => {
			await toggleProductActive(productId, !isActive);
			toast.success(isActive ? "Product deactivated" : "Product activated");
			router.refresh();
		});
	}

	return (
		<div className="flex items-center gap-1.5">
			<button
				onClick={handleToggle}
				disabled={isPending}
				aria-label={isActive ? "Deactivate product" : "Activate product"}
				title={isActive ? "Deactivate" : "Activate"}
				className="w-8 h-8 flex items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-500 duration-150 disabled:opacity-50"
			>
				{isActive ? <HiOutlineEyeOff /> : <HiOutlineEye />}
			</button>
			<Link
				href={`${pageRoutes.dashboard.products}/${productId}/edit`}
				aria-label="Edit product"
				title="Edit"
				className="w-8 h-8 flex items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-primary duration-150"
			>
				<HiOutlinePencil />
			</Link>
			<button
				onClick={handleDelete}
				disabled={isPending}
				aria-label="Delete product"
				title="Delete"
				className="w-8 h-8 flex items-center justify-center rounded-full text-neutral-400 hover:bg-red-50 hover:text-red-500 duration-150 disabled:opacity-50"
			>
				<HiOutlineTrash />
			</button>
		</div>
	);
}
