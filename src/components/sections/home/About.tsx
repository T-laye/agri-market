"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { GiCheckMark } from "react-icons/gi";
import Button from "@/components/ui/Button";

const checklist = [
	"Sell or buy directly — no middlemen taking a cut",
	"Transparent, real-time market pricing",
	"Every payment protected by secure escrow",
	"Verified farmers and accountable buyers",
];

export default function About() {
	return (
		<section id="about" className="custom-container py-16 md:py-24 lg:py-30">
			<div className="flex flex-col md:flex-row gap-10 md:gap-7.5 items-center">
				<motion.div
					className="relative w-full md:w-1/2 aspect-4/5 rounded-[15px] overflow-hidden"
					initial={{ opacity: 0, x: -40 }}
					whileInView={{ opacity: 1, x: 0 }}
					viewport={{ once: true, margin: "-50px" }}
					transition={{ duration: 0.6, ease: "easeOut" }}
				>
					<Image
						src="/images/home/about.jpg"
						alt="Farmer planting a seedling"
						fill
						sizes="(min-width: 768px) 50vw, 100vw"
						quality={90}
						className="object-cover"
					/>
				</motion.div>

				<motion.div
					className="w-full md:w-1/2 flex flex-col gap-6"
					initial={{ opacity: 0, x: 40 }}
					whileInView={{ opacity: 1, x: 0 }}
					viewport={{ once: true, margin: "-50px" }}
					transition={{ duration: 0.6, ease: "easeOut" }}
				>
					<span className="bg-secondary-100 text-secondary-700 rounded-[30px] px-7.25 py-[5.5px] w-fit text-sm font-semibold">
						Why AgriMarket
					</span>
					<h2 className="h2 text-neutral-500">
						Solving Nigeria&apos;s biggest farm-to-market problem
					</h2>
					<p className="p1 text-neutral-400">
						Farmers lose income to unfair middlemen pricing and post-harvest
						losses, while buyers have no trusted, centralized place to source
						produce. AgriMarket closes that gap with a direct, transparent
						marketplace built for both sides.
					</p>

					<ul className="flex flex-col gap-3.5">
						{checklist.map((point, i) => (
							<motion.li
								key={point}
								className="flex items-start gap-3"
								initial={{ opacity: 0, x: 20 }}
								whileInView={{ opacity: 1, x: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.4, delay: i * 0.1 }}
							>
								<span className="mt-1 shrink-0 w-5 h-5 rounded-full bg-secondary-500 text-white flex items-center justify-center">
									<GiCheckMark className="text-[10px]" />
								</span>
								<span className="p1 text-neutral-400">{point}</span>
							</motion.li>
						))}
					</ul>

					<Button href="/signup" variant="primary" className="w-fit mt-2">
						Get Started
					</Button>
				</motion.div>
			</div>
		</section>
	);
}
