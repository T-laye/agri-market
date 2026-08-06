/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { HiMenu, HiX, HiOutlineLogout, HiOutlineShieldCheck } from "react-icons/hi";
import { HiOutlineShoppingCart } from "react-icons/hi2";
import Logo from "./Logo";
import Button from "./ui/Button";
import CartDrawer from "./marketplace/CartDrawer";
import UserMenu from "./UserMenu";
import { useCartStore, selectTotalItems } from "@/store/cart";
import { useUser } from "@/hooks/useUser";
import { signOut } from "@/app/auth/actions";
import { resolveAvatarUrl } from "@/lib/avatar";
import { pageRoutes } from "@/lib/routes";

const navLinks = [
	{ label: "Marketplace", href: pageRoutes.marketplace },
	{ label: "About", href: "/#about" },
	{ label: "How it Works", href: "/#how-it-works" },
	{ label: "FAQ", href: "/#faq" },
];

export default function Header({ transparent = true }: { transparent?: boolean } = {}) {
	const [scrolled, setScrolled] = useState(false);
	const [open, setOpen] = useState(false);
	const [cartOpen, setCartOpen] = useState(false);
	const [mounted, setMounted] = useState(false);
	const totalItems = useCartStore(selectTotalItems);
	const { user, loading } = useUser();
	const avatarUrl = resolveAvatarUrl(user?.user_metadata);

	const solid = !transparent || scrolled;

	useEffect(() => {
		setMounted(true);
		if (!transparent) return;
		const onScroll = () => setScrolled(window.scrollY > 20);
		onScroll();
		window.addEventListener("scroll", onScroll);
		return () => window.removeEventListener("scroll", onScroll);
	}, [transparent]);

	return (
		<motion.header
			className="fixed inset-x-0 top-0 z-50"
			animate={{
				backgroundColor: solid ? "rgba(255,255,255,1)" : "rgba(255,255,255,0)",
				boxShadow: solid ? "0 1px 12px 0 rgba(0,0,0,0.08)" : "0 0 0 0 rgba(0,0,0,0)",
			}}
			transition={{ duration: 0.25 }}
		>
			<div className="custom-container flex items-center justify-between h-18 md:h-22">
				<Logo light={!solid} />

				<nav className="hidden lg:flex items-center gap-8 xl:gap-10">
					{navLinks.map((link) => (
						<a
							key={link.href}
							href={link.href}
							className={`text-sm font-medium duration-150 hover:text-secondary-500 ${
								solid ? "text-neutral-500" : "text-white"
							}`}
						>
							{link.label}
						</a>
					))}
				</nav>

				<div className="flex items-center gap-3 md:gap-4">
					<button
						aria-label="Open cart"
						onClick={() => setCartOpen(true)}
						className={`relative w-10 h-10 flex items-center justify-center rounded-full duration-150 ${
							solid
								? "text-neutral-500 hover:bg-neutral-100"
								: "text-white hover:bg-white/10"
						}`}
					>
						<HiOutlineShoppingCart className="text-xl" />
						{mounted && totalItems > 0 && (
							<span className="absolute -top-1 -right-1 min-w-4.5 h-4.5 px-1 flex items-center justify-center rounded-full bg-secondary-500 text-white text-[10px] font-bold">
								{totalItems}
							</span>
						)}
					</button>

					<div className="hidden lg:flex items-center gap-4">
						{!loading &&
							(user ? (
								<UserMenu user={user} scrolled={solid} />
							) : (
								<>
									<Button
										href={pageRoutes.auth.login}
										variant={solid ? "primary" : "ghost"}
										className="min-w-0 px-6 py-2.5"
									>
										Login
									</Button>
									<Button
										href={pageRoutes.auth.signup}
										variant="secondary"
										className="min-w-0 px-6 py-2.5"
									>
										Get Started
									</Button>
								</>
							))}
					</div>

					<button
						aria-label="Toggle menu"
						onClick={() => setOpen(true)}
						className={`lg:hidden text-3xl ${solid ? "text-primary" : "text-white"}`}
					>
						<HiMenu />
					</button>
				</div>
			</div>

			<AnimatePresence>
				{open && (
					<>
						<motion.div
							className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={() => setOpen(false)}
						/>
						<motion.div
							className="fixed top-0 right-0 h-full w-[75vw] max-w-xs bg-white z-50 shadow-2xl lg:hidden flex flex-col p-6 gap-8"
							initial={{ x: "100%" }}
							animate={{ x: 0 }}
							exit={{ x: "100%" }}
							transition={{ type: "spring", damping: 25, stiffness: 200 }}
						>
							<div className="flex items-center justify-between">
								<Logo />
								<button
									aria-label="Close menu"
									onClick={() => setOpen(false)}
									className="text-3xl text-primary"
								>
									<HiX />
								</button>
							</div>

							<nav className="flex flex-col gap-6">
								{navLinks.map((link, i) => (
									<motion.a
										key={link.href}
										href={link.href}
										onClick={() => setOpen(false)}
										initial={{ opacity: 0, x: 20 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ delay: 0.1 + i * 0.05 }}
										className="text-base font-medium text-neutral-500 hover:text-primary duration-150"
									>
										{link.label}
									</motion.a>
								))}
							</nav>

							<div className="mt-auto flex flex-col gap-3">
								{!loading &&
									(user ? (
										<>
											<Link
												href={pageRoutes.dashboard.profile}
												onClick={() => setOpen(false)}
												className="flex items-center gap-3 px-1 pb-2"
											>
												<span className="relative w-9 h-9 rounded-full overflow-hidden bg-secondary-500 shrink-0">
													{avatarUrl ? (
														<Image
															src={avatarUrl}
															alt=""
															fill
															sizes="36px"
															className="object-cover"
															unoptimized
														/>
													) : (
														<span className="w-full h-full flex items-center justify-center text-white text-sm font-bold">
															{((user.user_metadata?.name as string) || user.email || "A")
																.charAt(0)
																.toUpperCase()}
														</span>
													)}
												</span>
												<div className="min-w-0">
													<p className="text-sm font-semibold text-neutral-500 truncate">
														{(user.user_metadata?.name as string) || "Account"}
													</p>
													<p className="text-xs text-neutral-400 truncate">{user.email}</p>
												</div>
											</Link>
											{user.user_metadata?.is_admin && (
												<Link
													href={pageRoutes.admin.index}
													onClick={() => setOpen(false)}
													className="w-full flex items-center justify-center gap-2 rounded-[30px] px-8 py-3.5 text-sm font-semibold border-2 border-primary-900 text-primary-900 hover:bg-primary-100 duration-150"
												>
													<HiOutlineShieldCheck />
													Admin Dashboard
												</Link>
											)}
											<Link
												href={
													user.user_metadata?.is_farmer
														? pageRoutes.dashboard.verification
														: pageRoutes.becomeFarmer
												}
												onClick={() => setOpen(false)}
												className={`w-full flex items-center justify-center gap-2 rounded-[30px] px-8 py-3.5 text-sm font-semibold border-2 duration-150 ${
													user.user_metadata?.is_farmer
														? "border-neutral-200 text-neutral-500 hover:border-primary hover:text-primary"
														: "border-primary text-primary hover:bg-primary-100"
												}`}
											>
												{user.user_metadata?.is_farmer
													? "Verification"
													: "Become a Farmer"}
											</Link>
											<form action={signOut}>
												<button
													type="submit"
													className="w-full flex items-center justify-center gap-2 rounded-[30px] px-8 py-3.5 text-sm font-semibold border-2 border-red-500 text-red-500 hover:bg-red-50 duration-150"
												>
													<HiOutlineLogout />
													Sign Out
												</button>
											</form>
										</>
									) : (
										<>
											<Button href={pageRoutes.auth.login} variant="primary" className="w-full">
												Login
											</Button>
											<Button href={pageRoutes.auth.signup} variant="secondary" className="w-full">
												Get Started
											</Button>
										</>
									))}
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>

			<CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
		</motion.header>
	);
}
