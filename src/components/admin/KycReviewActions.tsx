"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { approveFarmerKyc, rejectFarmerKyc } from "@/app/admin/actions";
import Button from "@/components/ui/Button";
import type { KycStatus } from "@/lib/data/farmer";

export default function KycReviewActions({
	farmerId,
	kycStatus,
}: {
	farmerId: string;
	kycStatus: KycStatus;
}) {
	const [isPending, startTransition] = useTransition();
	const [showRejectForm, setShowRejectForm] = useState(false);
	const [reason, setReason] = useState("");
	const router = useRouter();

	if (kycStatus !== "pending") {
		return null;
	}

	function handleApprove() {
		if (!window.confirm("Approve this farmer's verification?")) return;
		startTransition(async () => {
			const result = await approveFarmerKyc(farmerId);
			if (result.error) {
				toast.error(result.error);
				return;
			}
			toast.success("Farmer verified");
			router.refresh();
		});
	}

	function handleReject() {
		if (!reason.trim()) {
			toast.error("Please provide a reason for rejection.");
			return;
		}
		startTransition(async () => {
			const result = await rejectFarmerKyc(farmerId, reason);
			if (result.error) {
				toast.error(result.error);
				return;
			}
			toast.success("Verification rejected");
			setShowRejectForm(false);
			setReason("");
			router.refresh();
		});
	}

	return (
		<div className="flex flex-col gap-3">
			{showRejectForm ? (
				<div className="flex flex-col gap-3">
					<textarea
						value={reason}
						onChange={(e) => setReason(e.target.value)}
						placeholder="Explain why this submission is being rejected…"
						rows={3}
						className="input-class"
					/>
					<div className="flex items-center gap-3">
						<Button onClick={handleReject} disabled={isPending} variant="primary">
							{isPending ? "Submitting…" : "Confirm Rejection"}
						</Button>
						<button
							onClick={() => setShowRejectForm(false)}
							disabled={isPending}
							className="text-xs text-neutral-400 hover:text-neutral-500 duration-150"
						>
							Cancel
						</button>
					</div>
				</div>
			) : (
				<div className="flex flex-wrap items-center gap-3">
					<Button onClick={handleApprove} disabled={isPending} variant="primary">
						{isPending ? "Approving…" : "Approve Verification"}
					</Button>
					<button
						onClick={() => setShowRejectForm(true)}
						disabled={isPending}
						className="rounded-[30px] border border-red-200 text-red-600 text-sm font-semibold px-5 py-2.5 hover:bg-red-50 duration-150 disabled:opacity-50"
					>
						Reject
					</button>
				</div>
			)}
		</div>
	);
}
