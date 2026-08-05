"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { HiOutlinePlus, HiX } from "react-icons/hi";
import { createClient } from "@/lib/supabase/client";

const MAX_IMAGES = 5;
const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

async function uploadProductImage(file: File, farmerId: string) {
	const supabase = createClient();
	const ext = file.name.split(".").pop() || "jpg";
	const path = `${farmerId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

	const { error } = await supabase.storage.from("product-images").upload(path, file);
	if (error) throw error;

	const { data } = supabase.storage.from("product-images").getPublicUrl(path);
	return data.publicUrl;
}

export default function ProductImageUpload({
	farmerId,
	initialImages = [],
	onUploadingChange,
}: {
	farmerId: string;
	initialImages?: string[];
	onUploadingChange?: (uploading: boolean) => void;
}) {
	const [images, setImages] = useState<string[]>(initialImages);
	const [uploading, setUploading] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	function setUploadingState(value: boolean) {
		setUploading(value);
		onUploadingChange?.(value);
	}

	async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
		const files = Array.from(e.target.files ?? []);
		e.target.value = "";
		if (files.length === 0) return;

		const remaining = MAX_IMAGES - images.length;
		if (remaining <= 0) {
			toast.error(`You can upload up to ${MAX_IMAGES} photos`);
			return;
		}

		const toUpload = files.slice(0, remaining);
		setUploadingState(true);

		for (const file of toUpload) {
			if (!ALLOWED_TYPES.includes(file.type)) {
				toast.error(`${file.name}: please upload a JPEG, PNG, or WebP image`);
				continue;
			}
			if (file.size > MAX_BYTES) {
				toast.error(`${file.name}: must be smaller than 4MB`);
				continue;
			}

			try {
				const url = await uploadProductImage(file, farmerId);
				setImages((prev) => [...prev, url]);
			} catch (err) {
				const message = err instanceof Error ? err.message : "Unknown error";
				console.error("Product image upload failed:", err);
				toast.error(`Couldn't upload ${file.name}: ${message}`);
			}
		}

		setUploadingState(false);
	}

	function removeImage(url: string) {
		setImages((prev) => prev.filter((img) => img !== url));
	}

	return (
		<div className="flex flex-col gap-2">
			{images.map((url) => (
				<input key={url} type="hidden" name="images" value={url} />
			))}

			<div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
				{images.map((url) => (
					<div key={url} className="relative aspect-square rounded-[10px] overflow-hidden group">
						<Image src={url} alt="Product photo" fill sizes="120px" className="object-cover" unoptimized />
						<button
							type="button"
							onClick={() => removeImage(url)}
							aria-label="Remove photo"
							className="absolute top-1.5 right-1.5 w-6 h-6 flex items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 duration-150"
						>
							<HiX className="text-xs" />
						</button>
					</div>
				))}

				{images.length < MAX_IMAGES && (
					<button
						type="button"
						onClick={() => inputRef.current?.click()}
						disabled={uploading}
						className="aspect-square flex flex-col items-center justify-center gap-1 rounded-[10px] border-2 border-dashed border-neutral-200 text-neutral-400 hover:border-primary hover:text-primary duration-150"
					>
						<HiOutlinePlus className="text-xl" />
						<span className="text-xs">{uploading ? "Uploading…" : "Add photo"}</span>
					</button>
				)}
			</div>

			<span className="text-xs text-neutral-400">
				Up to {MAX_IMAGES} photos. JPEG, PNG, or WebP, max 4MB each.
			</span>

			<input
				ref={inputRef}
				type="file"
				accept="image/jpeg,image/png,image/webp"
				multiple
				onChange={handleChange}
				className="hidden"
			/>
		</div>
	);
}
