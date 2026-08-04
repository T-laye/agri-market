import {
	HiOutlineClock,
	HiOutlineBadgeCheck,
	HiOutlineExclamationCircle,
	HiOutlineXCircle,
} from "react-icons/hi";
import type { KycStatus } from "@/lib/data/farmer";

const config: Record<
	KycStatus,
	{ label: string; className: string; icon: React.ComponentType<{ className?: string }> }
> = {
	not_submitted: {
		label: "Not Submitted",
		className: "bg-neutral-100 text-neutral-400",
		icon: HiOutlineExclamationCircle,
	},
	pending: {
		label: "Pending Review",
		className: "bg-accent-500 text-accent-900",
		icon: HiOutlineClock,
	},
	verified: {
		label: "Verified",
		className: "bg-secondary-100 text-secondary-700",
		icon: HiOutlineBadgeCheck,
	},
	rejected: {
		label: "Rejected",
		className: "bg-red-100 text-red-600",
		icon: HiOutlineXCircle,
	},
};

export default function VerificationBadge({ status }: { status: KycStatus }) {
	const { label, className, icon: Icon } = config[status];

	return (
		<span
			className={`inline-flex items-center gap-1.5 rounded-[30px] px-3.5 py-1.5 text-xs font-semibold w-fit ${className}`}
		>
			<Icon className="text-sm" />
			{label}
		</span>
	);
}
