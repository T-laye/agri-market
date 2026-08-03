"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiMenu, HiX } from "react-icons/hi";
import Logo from "./Logo";
import Button from "./ui/Button";

const navLinks = [
	{ label: "About", href: "#about" },
	{ label: "How it Works", href: "#how-it-works" },
	{ label: "Features", href: "#features" },
	{ label: "FAQ", href: "#faq" },
];

export default function Header() {
	const [scrolled, setScrolled] = useState(false);
	const [open, setOpen] = useState(false);

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 20);
		onScroll();
		window.addEventListener("scroll", onScroll);
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	return (
		<motion.header
			className="fixed inset-x-0 top-0 z-50"
			animate={{
				backgroundColor: scrolled ? "rgba(255,255,255,1)" : "rgba(255,255,255,0)",
				boxShadow: scrolled ? "0 1px 12px 0 rgba(0,0,0,0.08)" : "0 0 0 0 rgba(0,0,0,0)",
			}}
			transition={{ duration: 0.25 }}
		>
			<div className="custom-container flex items-center justify-between h-18 md:h-22">
				<Logo light={!scrolled} />

				<nav className="hidden md:flex items-center gap-10">
					{navLinks.map((link) => (
						<a
							key={link.href}
							href={link.href}
							className={`text-sm font-medium duration-150 hover:text-secondary-500 ${
								scrolled ? "text-neutral-500" : "text-white"
							}`}
						>
							{link.label}
						</a>
					))}
				</nav>

				<div className="hidden md:flex items-center gap-4">
					<Button
						href="/login"
						variant={scrolled ? "primary" : "ghost"}
						className="min-w-0 px-6 py-2.5"
					>
						Login
					</Button>
					<Button href="/signup" variant="secondary" className="min-w-0 px-6 py-2.5">
						Get Started
					</Button>
				</div>

				<button
					aria-label="Toggle menu"
					onClick={() => setOpen(true)}
					className={`md:hidden text-3xl ${scrolled ? "text-primary" : "text-white"}`}
				>
					<HiMenu />
				</button>
			</div>

			<AnimatePresence>
				{open && (
					<>
						<motion.div
							className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={() => setOpen(false)}
						/>
						<motion.div
							className="fixed top-0 right-0 h-full w-[75vw] max-w-xs bg-white z-50 shadow-2xl md:hidden flex flex-col p-6 gap-8"
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
								<Button href="/login" variant="primary" className="w-full">
									Login
								</Button>
								<Button href="/signup" variant="secondary" className="w-full">
									Get Started
								</Button>
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</motion.header>
	);
}
