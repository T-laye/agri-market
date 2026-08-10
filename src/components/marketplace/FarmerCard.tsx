import Link from "next/link";
import { HiOutlineLocationMarker, HiOutlineCube } from "react-icons/hi";
import type { PublicFarmer } from "@/lib/data/publicFarmers";
import { pageRoutes } from "@/lib/routes";
import Avatar from "@/components/Avatar";
import FavoriteStarButton from "./FavoriteStarButton";

export default function FarmerCard({
	farmer,
	favorited,
}: {
	farmer: PublicFarmer;
	favorited: boolean;
}) {
	return (
		<Link
			href={`${pageRoutes.marketplaceFarmers}/${farmer.id}`}
			className="flex items-center gap-4 border border-neutral-200 rounded-[15px] p-5 duration-150 hover:border-primary"
		>
			<Avatar avatarUrl={farmer.avatarUrl} name={farmer.farmName} size={56} />

			<div className="flex-1 min-w-0">
				<p className="font-semibold text-sm text-neutral-500 truncate">{farmer.farmName}</p>
				<div className="flex items-center gap-3 mt-1 text-xs text-neutral-400">
					<span className="flex items-center gap-1">
						<HiOutlineLocationMarker /> {farmer.state} State
					</span>
					<span className="flex items-center gap-1">
						<HiOutlineCube /> {farmer.productCount}{" "}
						{farmer.productCount === 1 ? "product" : "products"}
					</span>
				</div>
			</div>

			<FavoriteStarButton farmerId={farmer.id} initialFavorited={favorited} className="shrink-0" />
		</Link>
	);
}
