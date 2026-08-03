import Link from "next/link";
import { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "reverse";

type ButtonProps = {
	variant?: ButtonVariant;
	href?: string;
	className?: string;
	children: React.ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const variants: Record<ButtonVariant, string> = {
	primary:
		"bg-primary text-white border-2 border-primary hover:bg-primary-600",
	secondary:
		"bg-secondary-500 text-white border-2 border-secondary-500 hover:bg-secondary-600",
	reverse:
		"bg-white text-primary border-2 border-white hover:bg-secondary-100",
	ghost:
		"bg-transparent backdrop-blur-[5px] text-white border-2 border-white hover:bg-white/10",
};

export default function Button({
	variant = "primary",
	href,
	className = "",
	children,
	...props
}: ButtonProps) {
	const classes = `inline-flex items-center justify-center rounded-[30px] px-8 md:px-10 py-3.5 text-sm lg:text-base font-semibold lg:font-bold transition-all duration-300 hover:scale-105 active:scale-100 min-w-[150px] ${variants[variant]} ${className}`;

	if (href) {
		return (
			<Link href={href} className={classes}>
				{children}
			</Link>
		);
	}

	return (
		<button className={classes} {...props}>
			{children}
		</button>
	);
}
