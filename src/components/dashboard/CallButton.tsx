import { HiOutlinePhone } from "react-icons/hi";

/** Click-to-call — opens the device's phone dialer via a tel: link. A
 * website can't place a PSTN call directly; this is how it "triggers"
 * one. Only rendered once a phone number is actually available (i.e.
 * revealed post-acceptance), so no need to handle a missing-number case. */
export default function CallButton({ phone, label }: { phone: string; label: string }) {
	return (
		<a
			href={`tel:${phone}`}
			className="flex items-center gap-1.5 rounded-[30px] border border-primary text-primary text-xs font-semibold px-3 py-2 hover:bg-primary-100 duration-150 shrink-0"
		>
			<HiOutlinePhone className="text-sm" />
			{label}
		</a>
	);
}
