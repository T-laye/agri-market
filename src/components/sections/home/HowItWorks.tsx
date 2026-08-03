"use client";

import { motion } from "framer-motion";
import {
	HiOutlineShoppingCart,
	HiOutlineCreditCard,
	HiOutlineLockClosed,
	HiOutlineTruck,
	HiOutlineCheckCircle,
} from "react-icons/hi";

const steps = [
	{
		icon: HiOutlineShoppingCart,
		title: "Place an Order",
		description: "Buyers browse verified farmers and add fresh produce to cart.",
	},
	{
		icon: HiOutlineCreditCard,
		title: "Pay Securely",
		description: "Payment is made upfront through the platform, never direct to the farmer.",
	},
	{
		icon: HiOutlineLockClosed,
		title: "Funds Held in Escrow",
		description: "AgriMarket holds the funds safely until the order is fulfilled.",
	},
	{
		icon: HiOutlineTruck,
		title: "Farmer Fulfills Order",
		description: "The farmer accepts, prepares, and dispatches the produce.",
	},
	{
		icon: HiOutlineCheckCircle,
		title: "Funds Released",
		description: "Once delivery is confirmed, escrow releases payment to the farmer.",
	},
];

export default function HowItWorks() {
	return (
		<section id="how-it-works" className="custom-container py-16 md:py-24 lg:py-30">
			<motion.div
				className="flex flex-col items-center text-center gap-4 max-w-2xl mx-auto mb-14"
				initial={{ opacity: 0, y: 20 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true, margin: "-50px" }}
				transition={{ duration: 0.5 }}
			>
				<span className="bg-secondary-100 text-secondary-700 rounded-[30px] px-7.25 py-[5.5px] w-fit text-sm font-semibold">
					How It Works
				</span>
				<h2 className="h2 text-neutral-500">
					Every order, protected end to end
				</h2>
				<p className="p1 text-neutral-400">
					Our escrow workflow keeps both farmers and buyers protected from
					order to delivery.
				</p>
			</motion.div>

			<motion.div
				className="grid grid-cols-1 min-[500px]:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-4 relative"
				variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
				initial="hidden"
				whileInView="visible"
				viewport={{ once: true, margin: "-50px" }}
			>
				<div className="hidden lg:block absolute top-8 left-0 right-0 h-[2px] bg-secondary-100" />

				{steps.map((step, i) => (
					<motion.div
						key={step.title}
						className="relative flex flex-col items-center text-center gap-3"
						variants={{
							hidden: { opacity: 0, y: 20 },
							visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
						}}
					>
						<span className="relative z-10 w-16 h-16 flex items-center justify-center rounded-full bg-primary text-white text-2xl">
							<step.icon />
						</span>
						<span className="text-xs font-bold text-secondary-500">
							Step {i + 1}
						</span>
						<h3 className="font-bold text-base text-neutral-500">{step.title}</h3>
						<p className="text-sm text-neutral-400 leading-6">{step.description}</p>
					</motion.div>
				))}
			</motion.div>
		</section>
	);
}
