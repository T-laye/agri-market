"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { HiOutlineShieldCheck } from "react-icons/hi";
import Button from "@/components/ui/Button";
import { pageRoutes } from "@/lib/routes";

const container = {
	hidden: {},
	visible: { transition: { staggerChildren: 0.15 } },
};

const item = {
	hidden: { opacity: 0, y: 30 },
	visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

export default function Hero() {
	return (
		<section className="relative min-h-180 flex items-end pt-24 pb-20 sm:pb-28 overflow-hidden">
			<Image
				src="/images/home/hero-bg.jpg"
				alt="Lush crop field at sunrise"
				fill
				priority
				sizes="100vw"
				quality={90}
				className="object-cover -z-20"
			/>
			<div className="absolute inset-0 bg-linear-to-t from-primary-900/90 via-primary-900/50 to-primary-900/20 -z-10" />

			<motion.div
				className="custom-container flex flex-col gap-6 sm:gap-7.5"
				variants={container}
				initial="hidden"
				animate="visible"
			>
				<motion.div
					variants={item}
					className="backdrop-blur-2xl bg-neutral-100/20 border border-white/20 rounded-[30px] px-5 py-2 w-fit flex items-center gap-2"
				>
					<HiOutlineShieldCheck className="text-primary-500 text-lg" />
					<span className="text-white text-xs sm:text-sm font-medium">
						Escrow-Protected Payments
					</span>
				</motion.div>

				<motion.h1
					variants={item}
					className="max-w-4xl text-[40px] sm:text-[56px] md:text-[72px] lg:text-[84px] font-bold leading-[1.05] text-white"
				>
					Fresh from the Farm,{" "}
					<span className="text-secondary-400">Straight to You</span>
				</motion.h1>

				<motion.p
					variants={item}
					className="max-w-xl p1 text-white/85"
				>
					AgriMarket connects Nigerian farmers directly with buyers — fair
					prices, real-time market information, and secure escrow payments.
					No middlemen, no guesswork.
				</motion.p>

				<motion.div variants={item} className="flex flex-col sm:flex-row gap-4 mt-2">
					<Button href={`${pageRoutes.auth.signup}?role=farmer`} variant="secondary">
						Join as a Farmer
					</Button>
					<Button href={pageRoutes.marketplace} variant="ghost">
						Shop Fresh Produce
					</Button>
				</motion.div>
			</motion.div>
		</section>
	);
}
