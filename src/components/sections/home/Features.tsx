"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { HiArrowRight } from "react-icons/hi";

const features = [
	{
		title: "Verified Farmers",
		description:
			"Every farmer on AgriMarket is verified by our admin team, so buyers know exactly who they're dealing with.",
		image: "/images/home/feature-verified-farmers.jpg",
	},
	{
		title: "Real-Time Market Prices",
		description:
			"Track live market prices across categories and locations to buy and sell with confidence.",
		image: "/images/home/feature-market-prices.jpg",
	},
	{
		title: "Wide Produce Selection",
		description:
			"From grains to fresh fruit, discover produce from farmers and cooperatives across Nigeria.",
		image: "/images/home/feature-produce.jpg",
	},
	{
		title: "Secure Escrow Payments",
		description:
			"Funds are held safely by the platform and released to farmers only after delivery is confirmed.",
		image: "/images/home/feature-escrow.jpg",
	},
	{
		title: "Search & Discovery",
		description:
			"Filter by category, location, and price to find exactly what you need in seconds.",
		image: "/images/home/feature-search.jpg",
	},
	{
		title: "Order Tracking & Reviews",
		description:
			"Follow your order from pending to delivered, then leave a review to help the community.",
		image: "/images/home/feature-orders.jpg",
	},
];

export default function Features() {
	return (
		<section id="features" className="bg-primary py-16 md:py-24 lg:py-30">
			<div className="custom-container">
				<motion.div
					className="flex flex-col items-center text-center gap-4 max-w-2xl mx-auto mb-14"
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, margin: "-50px" }}
					transition={{ duration: 0.5 }}
				>
					<span className="bg-accent-500 text-primary-800 rounded-[30px] px-7.25 py-[5.5px] w-fit text-sm font-semibold">
						Platform Features
					</span>
					<h2 className="h2 text-white">Everything you need in one place</h2>
					<p className="p1 text-white/75">
						Built for smallholder farmers, commercial growers, and every kind
						of buyer.
					</p>
				</motion.div>

				<motion.div
					className="grid grid-cols-1 min-[500px]:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-7.5"
					variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true, margin: "-50px" }}
				>
					{features.map((feature) => (
						<motion.div
							key={feature.title}
							className="service-card relative rounded-[15px] overflow-hidden group aspect-4/5"
							variants={{
								hidden: { opacity: 0, y: 20 },
								visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
							}}
						>
							<Image
								src={feature.image}
								alt={feature.title}
								fill
								sizes="(min-width: 768px) 33vw, (min-width: 500px) 50vw, 100vw"
								quality={85}
								className="object-cover"
							/>
							<div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

							<div className="absolute inset-0 flex flex-col justify-end p-6">
								<h3 className="text-lg font-bold text-white mb-1">
									{feature.title}
								</h3>
								<p className="text-sm text-white/80 leading-6 line-clamp-3">
									{feature.description}
								</p>
							</div>

							<div className="service-card-overlay absolute inset-0 bg-black/40 flex items-center justify-center">
								<span className="inline-flex items-center gap-2 bg-white text-primary rounded-[30px] px-6 py-2.5 text-sm font-semibold">
									Learn More <HiArrowRight />
								</span>
							</div>
						</motion.div>
					))}
				</motion.div>
			</div>
		</section>
	);
}
