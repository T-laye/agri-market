"use client";

import { useActionState, useState } from "react";
import {
	createProduct,
	updateProduct,
	type ProductActionState,
} from "@/app/dashboard/products/actions";
import { categories, locations, type Product } from "@/lib/data/products";
import ProductImageUpload from "@/components/dashboard/ProductImageUpload";
import Button from "@/components/ui/Button";

const initialState: ProductActionState = { error: null };

export default function ProductForm({
	mode,
	farmerId,
	product,
}: {
	mode: "create" | "edit";
	farmerId: string;
	product?: Product;
}) {
	const action =
		mode === "edit" && product ? updateProduct.bind(null, product.id) : createProduct;
	const [state, formAction, pending] = useActionState(action, initialState);
	const [imagesUploading, setImagesUploading] = useState(false);

	return (
		<form action={formAction} className="flex flex-col gap-5">
			<div className="flex flex-col gap-1.5">
				<span className="text-sm font-medium text-neutral-500">Photos</span>
				<ProductImageUpload
					farmerId={farmerId}
					initialImages={product?.images}
					onUploadingChange={setImagesUploading}
				/>
				{state.fieldErrors?.images && (
					<span className="text-xs text-red-600">{state.fieldErrors.images}</span>
				)}
			</div>

			<div className="flex flex-col gap-1.5">
				<label htmlFor="name" className="text-sm font-medium text-neutral-500">
					Product name
				</label>
				<input
					id="name"
					name="name"
					type="text"
					defaultValue={product?.name}
					placeholder="Fresh Vine Tomatoes"
					className="input-class"
				/>
				{state.fieldErrors?.name && (
					<span className="text-xs text-red-600">{state.fieldErrors.name}</span>
				)}
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div className="flex flex-col gap-1.5">
					<label htmlFor="category" className="text-sm font-medium text-neutral-500">
						Category
					</label>
					<select
						id="category"
						name="category"
						defaultValue={product?.category ?? ""}
						className="select-class"
					>
						<option value="" disabled>
							Select category
						</option>
						{categories.map((cat) => (
							<option key={cat} value={cat}>
								{cat}
							</option>
						))}
					</select>
					{state.fieldErrors?.category && (
						<span className="text-xs text-red-600">{state.fieldErrors.category}</span>
					)}
				</div>

				<div className="flex flex-col gap-1.5">
					<label htmlFor="unit" className="text-sm font-medium text-neutral-500">
						Unit
					</label>
					<input
						id="unit"
						name="unit"
						type="text"
						defaultValue={product?.unit}
						placeholder="per basket"
						className="input-class"
					/>
					{state.fieldErrors?.unit && (
						<span className="text-xs text-red-600">{state.fieldErrors.unit}</span>
					)}
				</div>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div className="flex flex-col gap-1.5">
					<label htmlFor="price" className="text-sm font-medium text-neutral-500">
						Price (₦)
					</label>
					<input
						id="price"
						name="price"
						type="number"
						step="0.01"
						min="0"
						defaultValue={product?.price}
						placeholder="8500"
						className="input-class"
					/>
					{state.fieldErrors?.price && (
						<span className="text-xs text-red-600">{state.fieldErrors.price}</span>
					)}
				</div>

				<div className="flex flex-col gap-1.5">
					<label htmlFor="quantity" className="text-sm font-medium text-neutral-500">
						Quantity in stock
					</label>
					<input
						id="quantity"
						name="quantity"
						type="number"
						min="0"
						defaultValue={product?.quantity}
						placeholder="20"
						className="input-class"
					/>
					{state.fieldErrors?.quantity && (
						<span className="text-xs text-red-600">{state.fieldErrors.quantity}</span>
					)}
				</div>
			</div>

			<div className="flex flex-col gap-1.5">
				<label htmlFor="description" className="text-sm font-medium text-neutral-500">
					Description
				</label>
				<textarea
					id="description"
					name="description"
					defaultValue={product?.description}
					placeholder="Juicy, vine-ripened tomatoes harvested fresh this week."
					className="textarea"
				/>
				{state.fieldErrors?.description && (
					<span className="text-xs text-red-600">{state.fieldErrors.description}</span>
				)}
			</div>

			<div className="flex flex-col gap-1.5">
				<label htmlFor="location" className="text-sm font-medium text-neutral-500">
					State
				</label>
				<select
					id="location"
					name="location"
					defaultValue={product?.location ?? ""}
					className="select-class"
				>
					<option value="" disabled>
						Select your state
					</option>
					{locations.map((loc) => (
						<option key={loc} value={loc}>
							{loc} State
						</option>
					))}
				</select>
				{state.fieldErrors?.location && (
					<span className="text-xs text-red-600">{state.fieldErrors.location}</span>
				)}
			</div>

			<div className="flex flex-col gap-1.5">
				<label htmlFor="address" className="text-sm font-medium text-neutral-500">
					Farm address
				</label>
				<input
					id="address"
					name="address"
					type="text"
					defaultValue={product?.address}
					placeholder="Along Ilaro-Owode Road, Yewa South LGA"
					className="input-class"
				/>
				{state.fieldErrors?.address && (
					<span className="text-xs text-red-600">{state.fieldErrors.address}</span>
				)}
			</div>

			{state.error && !state.fieldErrors && (
				<p className="text-sm text-red-600">{state.error}</p>
			)}

			{imagesUploading && (
				<p className="text-xs text-neutral-400">Waiting for photos to finish uploading…</p>
			)}

			<Button variant="primary" className="w-fit" disabled={pending || imagesUploading}>
				{pending
					? "Saving…"
					: imagesUploading
						? "Uploading photos…"
						: mode === "edit"
							? "Save Changes"
							: "List Product"}
			</Button>
		</form>
	);
}
