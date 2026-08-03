"use client";

import { motion } from "framer-motion";
import { GiFarmTractor, GiFruitBowl, GiWorld } from "react-icons/gi";
import { HiOutlineShieldCheck } from "react-icons/hi";

const stats = [
	{ icon: GiFarmTractor, value: "500+", label: "Farmers Onboarding" },
	{ icon: GiFruitBowl, value: "20+", label: "Produce Categories" },
	{ icon: GiWorld, value: "36", label: "States Covered" },
	{ icon: HiOutlineShieldCheck, value: "100%", label: "Escrow Protected" },
];

export default function Stats() {
	return (
		<section className="bg-accent-200">
			<div className="custom-container py-10 md:py-14">
				<motion.div
					className="grid grid-cols-2 md:grid-cols-4 gap-8"
					variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-50px" }}
				>
					{stats.map((stat) => (
						<motion.div
							key={stat.label}
							className="flex flex-col items-center text-center gap-2"
							variants={{
								hidden: { opacity: 0, y: 20 },
								visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
							}}
						>
							<stat.icon className="text-3xl text-primary" />
							<span className="text-2xl md:text-4xl font-bold text-neutral-500">
								{stat.value}
							</span>
							<span className="text-xs md:text-sm text-neutral-400">
								{stat.label}
							</span>
						</motion.div>
					))}
				</motion.div>
			</div>
		</section>
	);
}
