"use client";

import { useActionState, useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { HiOutlineCamera } from "react-icons/hi";
import { updateProfile, type DashboardState } from "@/app/dashboard/actions";
import { createClient } from "@/lib/supabase/client";
import { locations } from "@/lib/data/products";
import Button from "@/components/ui/Button";

const initialState: DashboardState = { error: null };

const MAX_AVATAR_BYTES = 3 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

async function uploadAvatar(file: File, userId: string) {
	const supabase = createClient();
	const ext = file.name.split(".").pop() || "jpg";
	const path = `${userId}/avatar.${ext}`;

	const { error } = await supabase.storage
		.from("avatars")
		.upload(path, file, { upsert: true, cacheControl: "3600" });

	if (error) {
		throw error;
	}

	const { data } = supabase.storage.from("avatars").getPublicUrl(path);
	return `${data.publicUrl}?t=${Date.now()}`;
}

export default function ProfileForm({
	userId,
	email,
	initialName,
	initialPhone,
	initialAvatarUrl,
	initialAddressState,
	initialCity,
	initialAddress,
	initialLandmark,
}: {
	userId: string;
	email: string;
	initialName: string;
	initialPhone: string;
	initialAvatarUrl: string;
	initialAddressState: string;
	initialCity: string;
	initialAddress: string;
	initialLandmark: string;
}) {
	const [state, formAction, pending] = useActionState(updateProfile, initialState);
	const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
	const [uploading, setUploading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;

		if (!ALLOWED_TYPES.includes(file.type)) {
			toast.error("Please upload a JPEG, PNG, or WebP image");
			return;
		}
		if (file.size > MAX_AVATAR_BYTES) {
			toast.error("Image must be smaller than 3MB");
			return;
		}

		const localPreview = URL.createObjectURL(file);
		setAvatarUrl(localPreview);
		setUploading(true);

		try {
			const uploadedUrl = await uploadAvatar(file, userId);
			setAvatarUrl(uploadedUrl);
			toast.success("Photo uploaded");
		} catch {
			toast.error("Couldn't upload photo — please try again");
			setAvatarUrl(initialAvatarUrl);
		} finally {
			setUploading(false);
		}
	}

	return (
		<form action={formAction} className="flex flex-col gap-6">
			<input type="hidden" name="avatarUrl" value={avatarUrl} />

			<div className="flex items-center gap-5">
				<button
					type="button"
					onClick={() => fileInputRef.current?.click()}
					className="relative w-20 h-20 rounded-full overflow-hidden bg-primary-100 shrink-0 group"
					aria-label="Change profile picture"
				>
					{avatarUrl ? (
						<Image
							src={avatarUrl}
							alt="Profile picture"
							fill
							sizes="80px"
							className="object-cover"
							unoptimized
						/>
					) : (
						<span className="w-full h-full flex items-center justify-center text-primary text-2xl font-bold">
							{initialName.charAt(0).toUpperCase() || "A"}
						</span>
					)}
					<span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 duration-150">
						<HiOutlineCamera className="text-white text-xl" />
					</span>
					{uploading && (
						<span className="absolute inset-0 flex items-center justify-center bg-black/50">
							<span className="w-5 h-5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
						</span>
					)}
				</button>
				<div className="flex flex-col gap-1">
					<button
						type="button"
						onClick={() => fileInputRef.current?.click()}
						className="text-sm font-semibold text-primary hover:underline w-fit"
					>
						Change photo
					</button>
					<span className="text-xs text-neutral-400">JPEG, PNG or WebP. Max 3MB.</span>
				</div>
				<input
					ref={fileInputRef}
					type="file"
					accept="image/jpeg,image/png,image/webp"
					onChange={handleFileChange}
					className="hidden"
				/>
			</div>

			<div className="flex flex-col gap-1.5">
				<label htmlFor="name" className="text-sm font-medium text-neutral-500">
					Full name
				</label>
				<input
					id="name"
					name="name"
					type="text"
					defaultValue={initialName}
					placeholder="Ada Okafor"
					className="input-class"
				/>
				{state.fieldErrors?.name && (
					<span className="text-xs text-red-600">{state.fieldErrors.name}</span>
				)}
			</div>

			<div className="flex flex-col gap-1.5">
				<label htmlFor="email" className="text-sm font-medium text-neutral-500">
					Email
				</label>
				<input
					id="email"
					type="email"
					value={email}
					disabled
					className="input-class opacity-60 cursor-not-allowed"
				/>
				<span className="text-xs text-neutral-400">Your email can&apos;t be changed here.</span>
			</div>

			<div className="flex flex-col gap-1.5">
				<label htmlFor="phone" className="text-sm font-medium text-neutral-500">
					Phone number
				</label>
				<input
					id="phone"
					name="phone"
					type="tel"
					defaultValue={initialPhone}
					placeholder="080XXXXXXXX"
					className="input-class"
				/>
				{state.fieldErrors?.phone && (
					<span className="text-xs text-red-600">{state.fieldErrors.phone}</span>
				)}
			</div>

			<div className="flex flex-col gap-1 pt-2">
				<span className="text-sm font-semibold text-neutral-500">Delivery Address</span>
				<span className="text-xs text-neutral-400">
					Saved here so it&apos;s ready to go when you check out.
				</span>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div className="flex flex-col gap-1.5">
					<label htmlFor="state" className="text-sm font-medium text-neutral-500">
						State
					</label>
					<select
						id="state"
						name="state"
						defaultValue={initialAddressState}
						className="select-class"
					>
						<option value="">Select state</option>
						{locations.map((loc) => (
							<option key={loc} value={loc}>
								{loc} State
							</option>
						))}
					</select>
					{state.fieldErrors?.state && (
						<span className="text-xs text-red-600">{state.fieldErrors.state}</span>
					)}
				</div>

				<div className="flex flex-col gap-1.5">
					<label htmlFor="city" className="text-sm font-medium text-neutral-500">
						City / Town
					</label>
					<input
						id="city"
						name="city"
						type="text"
						defaultValue={initialCity}
						placeholder="Ikeja"
						className="input-class"
					/>
					{state.fieldErrors?.city && (
						<span className="text-xs text-red-600">{state.fieldErrors.city}</span>
					)}
				</div>
			</div>

			<div className="flex flex-col gap-1.5">
				<label htmlFor="address" className="text-sm font-medium text-neutral-500">
					Street address
				</label>
				<input
					id="address"
					name="address"
					type="text"
					defaultValue={initialAddress}
					placeholder="12 Allen Avenue"
					className="input-class"
				/>
				{state.fieldErrors?.address && (
					<span className="text-xs text-red-600">{state.fieldErrors.address}</span>
				)}
			</div>

			<div className="flex flex-col gap-1.5">
				<label htmlFor="landmark" className="text-sm font-medium text-neutral-500">
					Nearby landmark <span className="text-neutral-400 font-normal">(optional)</span>
				</label>
				<input
					id="landmark"
					name="landmark"
					type="text"
					defaultValue={initialLandmark}
					placeholder="Opposite First Bank"
					className="input-class"
				/>
				{state.fieldErrors?.landmark && (
					<span className="text-xs text-red-600">{state.fieldErrors.landmark}</span>
				)}
			</div>

			{state.error && !state.fieldErrors && (
				<p className="text-sm text-red-600">{state.error}</p>
			)}
			{state.success && <p className="text-sm text-secondary-700">{state.success}</p>}

			<Button
				variant="primary"
				className="w-fit"
				disabled={pending || uploading}
			>
				{pending ? "Saving…" : "Save Changes"}
			</Button>
		</form>
	);
}
