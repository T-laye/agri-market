"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiPlus, FiMinus } from "react-icons/fi";

const faqs = [
	{
		question: "How does escrow protect my payment?",
		answer:
			"When you pay for an order, AgriMarket holds the funds securely. The farmer only gets paid after you've confirmed delivery — or after an admin resolves a dispute in the farmer's favor.",
	},
	{
		question: "How do I become a verified farmer?",
		answer:
			"Register as a farmer, complete your profile, and submit it for review. Our admin team verifies each farmer before they can start listing products.",
	},
	{
		question: "What happens if there's a dispute?",
		answer:
			"If a buyer and farmer disagree over an order, either party can raise it with our admin team, who will review the case and resolve fund release accordingly.",
	},
	{
		question: "Who handles delivery of my produce?",
		answer:
			"Transportation is arranged directly between buyer and farmer, or through a third-party logistics provider of their choice. AgriMarket focuses on listings, payments, and trust.",
	},
	{
		question: "Can I track the status of my order?",
		answer:
			"Yes. Every order moves through clear stages — Pending, Accepted, Preparing, In Transit, Delivered, Completed — visible from your buyer dashboard.",
	},
	{
		question: "Can I leave a review after my purchase?",
		answer:
			"Absolutely. Once an order is completed, buyers can rate and review the farmer to help build trust across the marketplace.",
	},
];

function FaqItem({ question, answer }: { question: string; answer: string }) {
	const [open, setOpen] = useState(false);

	return (
		<div className="border-b border-neutral-200 pb-5">
			<button
				onClick={() => setOpen((o) => !o)}
				className="w-full flex items-center justify-between gap-4 text-left"
			>
				<span className="font-semibold text-base text-neutral-500">
					{question}
				</span>
				<motion.span
					animate={{ rotate: open ? 180 : 0 }}
					transition={{ duration: 0.2 }}
					className="flex-shrink-0 text-primary text-lg"
				>
					{open ? <FiMinus /> : <FiPlus />}
				</motion.span>
			</button>
			<AnimatePresence initial={false}>
				{open && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.25 }}
						className="overflow-hidden"
					>
						<p className="pt-3 text-sm text-neutral-400 leading-6">{answer}</p>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

export default function Faq() {
	return (
		<section id="faq" className="custom-container py-16 md:py-24 lg:py-30">
			<motion.div
				className="flex flex-col items-center text-center gap-4 max-w-2xl mx-auto mb-14"
				initial={{ opacity: 0, y: 20 }}
				whileInView={{ opacity: 1, y: 0 }}
				viewport={{ once: true, margin: "-50px" }}
				transition={{ duration: 0.5 }}
			>
				<span className="bg-secondary-100 text-secondary-700 rounded-[30px] px-7.25 py-[5.5px] w-fit text-sm font-semibold">
					FAQ
				</span>
				<h2 className="h2 text-neutral-500">Frequently asked questions</h2>
				<p className="p1 text-neutral-400">
					Everything you need to know before you buy or sell on AgriMarket.
				</p>
			</motion.div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 lg:gap-x-16 gap-y-6">
				{faqs.map((faq) => (
					<FaqItem key={faq.question} {...faq} />
				))}
			</div>
		</section>
	);
}
