import { HiOutlineLocationMarker, HiOutlineCube } from "react-icons/hi";
import type { PublicFarmer } from "@/lib/data/publicFarmers";
import FavoriteStarButton from "./FavoriteStarButton";

export default function FarmerCard({
	farmer,
	favorited,
}: {
	farmer: PublicFarmer;
	favorited: boolean;
}) {
	const initial = farmer.farmName.charAt(0).toUpperCase() || "A";

	return (
		<div className="flex items-center gap-4 border border-neutral-200 rounded-[15px] p-5 duration-150 hover:border-primary">
			<span className="w-14 h-14 rounded-full bg-primary-100 text-primary flex items-center justify-center text-xl font-bold shrink-0">
				{initial}
			</span>

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
		</div>
	);
}
