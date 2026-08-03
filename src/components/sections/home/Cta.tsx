"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";

export default function Cta() {
	return (
		<section id="cta">
			<div className="flex h-1.5 sm:h-6">
				<div className="flex-1 bg-primary" />
				<div className="flex-1 bg-secondary-300" />
			</div>

			<div className="relative py-24 md:py-32">
				<Image
					src="/images/home/cta-bg.jpg"
					alt="Farmland at sunrise"
					fill
					sizes="100vw"
					quality={85}
					className="object-cover -z-20"
				/>
				<div className="absolute inset-0 bg-primary-900/70 -z-10" />

				<div className="custom-container">
					<motion.div
						className="max-w-3xl mx-auto bg-[#111]/61 border border-white/10 rounded-[10px] backdrop-blur-[5px] px-6 py-10 sm:px-14 sm:py-14 flex flex-col items-center text-center gap-6"
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, margin: "-50px" }}
						transition={{ duration: 0.6, ease: "easeOut" }}
					>
						<h2 className="h2 text-white">
							Ready to trade directly and fairly?
						</h2>
						<p className="p1 text-white/80 max-w-xl">
							Join AgriMarket today — whether you&apos;re growing it or
							buying it, we make the connection simple and secure.
						</p>
						<div className="flex flex-col sm:flex-row gap-4 mt-2">
							<Button href="/signup?role=farmer" variant="secondary">
								I&apos;m a Farmer
							</Button>
							<Button href="/signup?role=buyer" variant="reverse">
								I&apos;m a Buyer
							</Button>
						</div>
					</motion.div>
				</div>
			</div>
		</section>
	);
}
