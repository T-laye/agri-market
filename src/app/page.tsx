import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/components/sections/home/Hero";
import About from "@/components/sections/home/About";
import HowItWorks from "@/components/sections/home/HowItWorks";
import Features from "@/components/sections/home/Features";
import Stats from "@/components/sections/home/Stats";
import Faq from "@/components/sections/home/Faq";
import Cta from "@/components/sections/home/Cta";

export default function Home() {
	return (
		<>
			<Header />
			<main className="flex-1">
				<Hero />
				<About />
				<HowItWorks />
				<Stats />
				<Features />
				<Faq />
				<Cta />
			</main>
			<Footer />
		</>
	);
}
