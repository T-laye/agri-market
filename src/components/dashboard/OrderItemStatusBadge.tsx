import {
	HiOutlineClock,
	HiOutlineCheckCircle,
	HiOutlineFire,
	HiOutlineTruck,
	HiOutlineBadgeCheck,
	HiOutlineXCircle,
} from "react-icons/hi";
import type { OrderItemStatus } from "@/lib/data/orders";

const config: Record<
	OrderItemStatus,
	{ label: string; className: string; icon: React.ComponentType<{ className?: string }> }
> = {
	pending: {
		label: "Pending",
		className: "bg-neutral-100 text-neutral-400",
		icon: HiOutlineClock,
	},
	accepted: {
		label: "Accepted",
		className: "bg-accent-500 text-accent-900",
		icon: HiOutlineCheckCircle,
	},
	preparing: {
		label: "Preparing",
		className: "bg-accent-500 text-accent-900",
		icon: HiOutlineFire,
	},
	in_transit: {
		label: "In Transit",
		className: "bg-secondary-100 text-secondary-700",
		icon: HiOutlineTruck,
	},
	delivered: {
		label: "Delivered",
		className: "bg-secondary-100 text-secondary-700",
		icon: HiOutlineBadgeCheck,
	},
	completed: {
		label: "Completed",
		className: "bg-primary-100 text-primary",
		icon: HiOutlineBadgeCheck,
	},
	cancelled: {
		label: "Cancelled",
		className: "bg-red-100 text-red-600",
		icon: HiOutlineXCircle,
	},
};

export default function OrderItemStatusBadge({ status }: { status: OrderItemStatus }) {
	const { label, className, icon: Icon } = config[status];

	return (
		<span
			className={`inline-flex items-center gap-1.5 rounded-[30px] px-3 py-1 text-xs font-semibold w-fit shrink-0 ${className}`}
		>
			<Icon className="text-sm" />
			{label}
		</span>
	);
}
