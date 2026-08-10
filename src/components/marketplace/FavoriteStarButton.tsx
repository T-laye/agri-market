"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { HiStar, HiOutlineStar } from "react-icons/hi";
import { toggleFavoriteFarmer } from "@/app/marketplace/farmers/actions";
import { useUser } from "@/hooks/useUser";
import { pageRoutes } from "@/lib/routes";

export default function FavoriteStarButton({
	farmerId,
	initialFavorited,
	className = "",
}: {
	farmerId: string;
	initialFavorited: boolean;
	className?: string;
}) {
	const { user, loading } = useUser();
	const [favorited, setFavorited] = useState(initialFavorited);
	const [pending, startTransition] = useTransition();
	const router = useRouter();

	function handleClick(e: React.MouseEvent) {
		e.stopPropagation();
		e.preventDefault();

		if (loading || pending) return;

		if (!user) {
			router.push(`${pageRoutes.auth.login}?redirect=${pageRoutes.marketplaceFarmers}`);
			return;
		}

		const next = !favorited;
		setFavorited(next);

		startTransition(async () => {
			const result = await toggleFavoriteFarmer(farmerId);
			if (result.error) {
				setFavorited(!next);
				toast.error(result.error);
				return;
			}
			if (typeof result.favorited === "boolean") {
				setFavorited(result.favorited);
			}
		});
	}

	return (
		<button
			type="button"
			onClick={handleClick}
			aria-label={favorited ? "Remove from favorite farmers" : "Add to favorite farmers"}
			aria-pressed={favorited}
			className={`flex items-center justify-center rounded-full duration-150 ${
				favorited ? "text-secondary-500" : "text-neutral-300 hover:text-secondary-500"
			} ${className}`}
		>
			{favorited ? <HiStar className="text-xl" /> : <HiOutlineStar className="text-xl" />}
		</button>
	);
}
