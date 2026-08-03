"use client";

import { useState, forwardRef } from "react";
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";

type PasswordInputProps = React.InputHTMLAttributes<HTMLInputElement>;

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
	function PasswordInput({ className = "", ...props }, ref) {
		const [visible, setVisible] = useState(false);

		return (
			<div className="relative">
				<input
					ref={ref}
					type={visible ? "text" : "password"}
					className={`${className} pr-11`}
					{...props}
				/>
				<button
					type="button"
					onClick={() => setVisible((v) => !v)}
					aria-label={visible ? "Hide password" : "Show password"}
					tabIndex={-1}
					className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-500 text-lg"
				>
					{visible ? <HiOutlineEyeOff /> : <HiOutlineEye />}
				</button>
			</div>
		);
	}
);

export default PasswordInput;
