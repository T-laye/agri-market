"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { User } from "@supabase/supabase-js";
import {
	HiOutlineLogout,
	HiChevronDown,
	HiOutlineUserCircle,
	HiOutlineSparkles,
	HiOutlineBadgeCheck,
} from "react-icons/hi";
import { signOut } from "@/app/auth/actions";
import { pageRoutes } from "@/lib/routes";

export default function UserMenu({
	user,
	scrolled,
}: {
	user: User;
	scrolled: boolean;
}) {
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		function handleClick(e: MouseEvent) {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				setOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClick);
		return () => document.removeEventListener("mousedown", handleClick);
	}, []);

	const name = (user.user_metadata?.name as string) || user.email || "Account";
	const avatarUrl = user.user_metadata?.avatar_url as string | undefined;
	const isFarmer = Boolean(user.user_metadata?.is_farmer);
	const initial = name.charAt(0).toUpperCase();

	return (
		<div className="relative" ref={ref}>
			<button
				onClick={() => setOpen((o) => !o)}
				aria-label="Account menu"
				className={`flex items-center gap-2 rounded-full pl-1.5 pr-3 py-1.5 duration-150 ${
					scrolled ? "hover:bg-neutral-100" : "hover:bg-white/10"
				}`}
			>
				<span className="relative w-8 h-8 rounded-full overflow-hidden bg-secondary-500 shrink-0">
					{avatarUrl ? (
						<Image src={avatarUrl} alt={name} fill sizes="32px" className="object-cover" unoptimized />
					) : (
						<span className="w-full h-full flex items-center justify-center text-white text-sm font-bold">
							{initial}
						</span>
					)}
				</span>
				<span
					className={`text-sm font-medium max-w-28 truncate ${
						scrolled ? "text-neutral-500" : "text-white"
					}`}
				>
					{name}
				</span>
				<HiChevronDown
					className={`text-sm duration-150 ${open ? "rotate-180" : ""} ${
						scrolled ? "text-neutral-400" : "text-white/70"
					}`}
				/>
			</button>

			{open && (
				<div className="absolute right-0 mt-2 w-52 bg-white rounded-[10px] shadow-xl border border-neutral-200 py-2 z-50">
					<div className="px-4 py-2 border-b border-neutral-100">
						<p className="text-sm font-semibold text-neutral-500 truncate">{name}</p>
						<p className="text-xs text-neutral-400 truncate">{user.email}</p>
					</div>
					<Link
						href={pageRoutes.dashboard.profile}
						onClick={() => setOpen(false)}
						className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-neutral-500 hover:bg-neutral-100 duration-150"
					>
						<HiOutlineUserCircle className="text-base" />
						My Profile
					</Link>
					{isFarmer ? (
						<Link
							href={pageRoutes.dashboard.verification}
							onClick={() => setOpen(false)}
							className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-neutral-500 hover:bg-neutral-100 duration-150"
						>
							<HiOutlineBadgeCheck className="text-base" />
							Verification
						</Link>
					) : (
						<Link
							href={pageRoutes.becomeFarmer}
							onClick={() => setOpen(false)}
							className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-primary hover:bg-primary-100 duration-150"
						>
							<HiOutlineSparkles className="text-base" />
							Become a Farmer
						</Link>
					)}
					<form action={signOut}>
						<button
							type="submit"
							className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 duration-150"
						>
							<HiOutlineLogout />
							Sign Out
						</button>
					</form>
				</div>
			)}
		</div>
	);
}
