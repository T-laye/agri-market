"use client";

import { useActionState, useRef, useState } from "react";
import { toast } from "sonner";
import { HiOutlineUpload, HiCheck } from "react-icons/hi";
import { submitKyc, type FarmerActionState } from "@/app/dashboard/farmer-actions";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";

const initialState: FarmerActionState = { error: null };
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

async function uploadDocument(
	file: File,
	userId: string,
	slot: "id-document" | "proof-document"
) {
	const supabase = createClient();
	const ext = file.name.split(".").pop() || "pdf";
	const path = `${userId}/${slot}.${ext}`;

	const { error } = await supabase.storage
		.from("kyc-documents")
		.upload(path, file, { upsert: true });

	if (error) throw error;
	return path;
}

function DocumentUploadSlot({
	label,
	hint,
	userId,
	slot,
	onUploaded,
}: {
	label: string;
	hint: string;
	userId: string;
	slot: "id-document" | "proof-document";
	onUploaded: (path: string) => void;
}) {
	const [fileName, setFileName] = useState("");
	const [uploading, setUploading] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;

		if (!ALLOWED_TYPES.includes(file.type)) {
			toast.error("Please upload a JPEG, PNG, WebP, or PDF file");
			return;
		}
		if (file.size > MAX_BYTES) {
			toast.error("File must be smaller than 5MB");
			return;
		}

		setUploading(true);
		try {
			const path = await uploadDocument(file, userId, slot);
			setFileName(file.name);
			onUploaded(path);
			toast.success(`${label} uploaded`);
		} catch {
			toast.error(`Couldn't upload ${label.toLowerCase()} — please try again`);
		} finally {
			setUploading(false);
		}
	}

	return (
		<div className="flex flex-col gap-1.5">
			<span className="text-sm font-medium text-neutral-500">{label}</span>
			<button
				type="button"
				onClick={() => inputRef.current?.click()}
				className={`flex items-center gap-3 border-2 border-dashed rounded-[10px] px-4 py-4 text-left duration-150 ${
					fileName
						? "border-primary bg-primary-100/40"
						: "border-neutral-200 hover:border-primary"
				}`}
			>
				<span
					className={`w-9 h-9 flex items-center justify-center rounded-full shrink-0 ${
						fileName ? "bg-primary text-white" : "bg-neutral-100 text-neutral-400"
					}`}
				>
					{fileName ? <HiCheck /> : <HiOutlineUpload />}
				</span>
				<span className="flex flex-col min-w-0">
					<span className="text-sm font-medium text-neutral-500 truncate">
						{uploading ? "Uploading…" : fileName || "Click to upload"}
					</span>
					<span className="text-xs text-neutral-400">{hint}</span>
				</span>
			</button>
			<input
				ref={inputRef}
				type="file"
				accept="image/jpeg,image/png,image/webp,application/pdf"
				onChange={handleChange}
				className="hidden"
			/>
		</div>
	);
}

export default function KycUploadForm({ userId }: { userId: string }) {
	const [state, formAction, pending] = useActionState(submitKyc, initialState);
	const [idDocumentPath, setIdDocumentPath] = useState("");
	const [proofDocumentPath, setProofDocumentPath] = useState("");

	return (
		<form action={formAction} className="flex flex-col gap-5">
			<input type="hidden" name="idDocumentUrl" value={idDocumentPath} />
			<input type="hidden" name="proofDocumentUrl" value={proofDocumentPath} />

			<DocumentUploadSlot
				label="Government-issued ID"
				hint="National ID, driver's license, or international passport"
				userId={userId}
				slot="id-document"
				onUploaded={setIdDocumentPath}
			/>
			{state.fieldErrors?.idDocumentUrl && (
				<span className="text-xs text-red-600 -mt-3">{state.fieldErrors.idDocumentUrl}</span>
			)}

			<DocumentUploadSlot
				label="Proof of farm or address"
				hint="Utility bill, CAC certificate, or land document"
				userId={userId}
				slot="proof-document"
				onUploaded={setProofDocumentPath}
			/>
			{state.fieldErrors?.proofDocumentUrl && (
				<span className="text-xs text-red-600 -mt-3">
					{state.fieldErrors.proofDocumentUrl}
				</span>
			)}

			{state.error && !state.fieldErrors && (
				<p className="text-sm text-red-600">{state.error}</p>
			)}
			{state.success && <p className="text-sm text-secondary-700">{state.success}</p>}

			<Button
				variant="primary"
				className="w-fit"
				disabled={pending || !idDocumentPath || !proofDocumentPath}
			>
				{pending ? "Submitting…" : "Submit for Review"}
			</Button>
		</form>
	);
}
