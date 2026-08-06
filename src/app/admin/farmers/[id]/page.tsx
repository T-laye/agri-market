import { redirect, notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { HiOutlinePhone, HiOutlineMail, HiOutlineLocationMarker, HiOutlineCube, HiOutlineCash } from "react-icons/hi";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getFarmerForAdmin } from "@/lib/data/admin";
import { pageRoutes } from "@/lib/routes";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminAvatar from "@/components/admin/AdminAvatar";
import VerificationBadge from "@/components/dashboard/VerificationBadge";
import KycReviewActions from "@/components/admin/KycReviewActions";

export const metadata: Metadata = {
	title: "Farmer Review | Admin | AgriMarket Nigeria",
};

const DOCUMENT_LABELS: Record<string, string> = {
	government_id: "Government-issued ID",
	proof_of_farm: "Proof of Farm Ownership / Lease",
};

function isImagePath(path: string) {
	return /\.(png|jpe?g|webp)$/i.test(path);
}

function formatNaira(amount: number) {
	return new Intl.NumberFormat("en-NG", {
		style: "currency",
		currency: "NGN",
		maximumFractionDigits: 0,
	}).format(amount);
}

export default async function AdminFarmerDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect(`${pageRoutes.auth.login}?redirect=${pageRoutes.admin.farmers}/${id}`);
	}
	if (!user.user_metadata?.is_admin) {
		redirect(pageRoutes.home);
	}

	let adminClient;
	try {
		adminClient = createAdminClient();
	} catch {
		adminClient = undefined;
	}
	const farmer = await getFarmerForAdmin(supabase, id, adminClient);
	if (!farmer) {
		notFound();
	}

	const documents = await Promise.all(
		(farmer.kyc_documents ?? []).map(async (doc) => {
			const { data } = await supabase.storage
				.from("kyc-documents")
				.createSignedUrl(doc.url, 60 * 10);
			return {
				type: doc.type,
				label: DOCUMENT_LABELS[doc.type] ?? doc.type,
				path: doc.url,
				signedUrl: data?.signedUrl ?? null,
			};
		})
	);

	const deliveryAddress = [
		farmer.deliveryAddress,
		farmer.deliveryCity,
		farmer.deliveryState ? `${farmer.deliveryState} State` : null,
	]
		.filter(Boolean)
		.join(", ");

	return (
		<AdminLayout>
			<div className="flex flex-col gap-8 max-w-3xl">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					<div className="flex items-center gap-4">
						<AdminAvatar avatarUrl={farmer.avatarUrl} name={farmer.name || farmer.farm_name} size={56} />
						<div>
							<div className="flex items-center gap-2 flex-wrap">
								<h2 className="font-bold text-lg text-neutral-500">{farmer.farm_name}</h2>
								{farmer.provider === "google" && (
									<span className="rounded-[30px] bg-blue-50 text-blue-600 text-[10px] font-semibold px-2.5 py-1">
										Google
									</span>
								)}
							</div>
							<p className="text-sm text-neutral-400">{farmer.name ?? "No name on file"}</p>
						</div>
					</div>
					<VerificationBadge status={farmer.kyc_status} />
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div className="flex flex-col gap-3 border border-neutral-200 rounded-[15px] p-4">
						<h3 className="font-semibold text-sm text-neutral-500">Contact</h3>
						<div className="flex flex-col gap-2 text-sm text-neutral-500">
							{farmer.email && (
								<span className="flex items-center gap-2">
									<HiOutlineMail className="text-neutral-400 shrink-0" /> {farmer.email}
								</span>
							)}
							<span className="flex items-center gap-2">
								<HiOutlinePhone className="text-neutral-400 shrink-0" /> {farmer.phone}
							</span>
							{deliveryAddress && (
								<span className="flex items-center gap-2">
									<HiOutlineLocationMarker className="text-neutral-400 shrink-0" /> {deliveryAddress}
								</span>
							)}
						</div>
						{farmer.createdAt && (
							<p className="text-xs text-neutral-400">
								Joined{" "}
								{new Date(farmer.createdAt).toLocaleDateString("en-NG", { dateStyle: "medium" })}
								{farmer.lastSignInAt && (
									<>
										{" "}
										· Last active{" "}
										{new Date(farmer.lastSignInAt).toLocaleDateString("en-NG", { dateStyle: "medium" })}
									</>
								)}
							</p>
						)}
					</div>

					<div className="flex flex-col gap-3 border border-neutral-200 rounded-[15px] p-4">
						<h3 className="font-semibold text-sm text-neutral-500">Activity</h3>
						<div className="flex flex-col gap-2 text-sm text-neutral-500">
							<span className="flex items-center gap-2">
								<HiOutlineCube className="text-neutral-400 shrink-0" /> {farmer.productCount}{" "}
								product{farmer.productCount === 1 ? "" : "s"} listed
							</span>
							<span className="flex items-center gap-2">
								<HiOutlineCash className="text-neutral-400 shrink-0" /> {formatNaira(farmer.totalSales)}{" "}
								in lifetime sales
							</span>
						</div>
					</div>
				</div>

				{farmer.kyc_status === "rejected" && farmer.rejection_reason && (
					<div className="rounded-[15px] bg-red-50 border border-red-100 p-4">
						<p className="text-xs font-semibold text-red-600 mb-1">Rejection reason</p>
						<p className="text-sm text-red-600">{farmer.rejection_reason}</p>
					</div>
				)}

				<div className="flex flex-col gap-4">
					<h3 className="font-semibold text-sm text-neutral-500">Submitted Documents</h3>
					{documents.length === 0 ? (
						<p className="text-sm text-neutral-400">No documents submitted yet.</p>
					) : (
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							{documents.map((doc) => (
								<div
									key={doc.type}
									className="border border-neutral-200 rounded-[15px] overflow-hidden"
								>
									<div className="relative w-full aspect-[4/3] bg-neutral-100">
										{doc.signedUrl && isImagePath(doc.path) ? (
											<Image
												src={doc.signedUrl}
												alt={doc.label}
												fill
												sizes="(max-width: 640px) 100vw, 400px"
												className="object-cover"
											/>
										) : (
											<div className="flex items-center justify-center h-full">
												<p className="text-xs text-neutral-400 px-4 text-center">
													{doc.signedUrl ? "PDF document" : "Unable to load document"}
												</p>
											</div>
										)}
									</div>
									<div className="flex items-center justify-between gap-2 p-3">
										<p className="text-xs font-semibold text-neutral-500">{doc.label}</p>
										{doc.signedUrl && (
											<a
												href={doc.signedUrl}
												target="_blank"
												rel="noopener noreferrer"
												className="text-xs font-semibold text-primary hover:underline shrink-0"
											>
												View
											</a>
										)}
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				{farmer.paystack_recipient_code && (
					<div className="flex flex-col gap-1 border border-neutral-200 rounded-[15px] p-4">
						<h3 className="font-semibold text-sm text-neutral-500 mb-1">Payout Account</h3>
						<p className="text-sm text-neutral-500">
							{farmer.account_name} · {farmer.bank_name}
						</p>
						<p className="text-xs text-neutral-400">
							{farmer.account_number}
						</p>
					</div>
				)}

				<KycReviewActions farmerId={farmer.id} kycStatus={farmer.kyc_status} />
			</div>
		</AdminLayout>
	);
}
