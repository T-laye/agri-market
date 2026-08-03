"use client";

import { useActionState, useState } from "react";
import { signup, type AuthState } from "@/app/auth/actions";
import Button from "@/components/ui/Button";

const initialState: AuthState = { error: null };

type Role = "farmer" | "buyer";

export default function SignupForm({ defaultRole }: { defaultRole: Role }) {
	const [state, formAction, pending] = useActionState(signup, initialState);
	const [role, setRole] = useState<Role>(defaultRole);

	if (state.success) {
		return (
			<div className="rounded-[10px] bg-secondary-100 text-secondary-700 p-4 text-sm leading-6">
				{state.success}
			</div>
		);
	}

	return (
		<form action={formAction} className="flex flex-col gap-5">
			<input type="hidden" name="role" value={role} />

			<div className="flex flex-col gap-1.5">
				<span className="text-sm font-medium text-neutral-500">I am a</span>
				<div className="grid grid-cols-2 gap-3">
					<button
						type="button"
						onClick={() => setRole("farmer")}
						className={`rounded-[10px] border-2 px-4 py-3 text-sm font-semibold duration-150 ${
							role === "farmer"
								? "border-primary bg-primary-100 text-primary"
								: "border-neutral-200 text-neutral-400"
						}`}
					>
						Farmer
					</button>
					<button
						type="button"
						onClick={() => setRole("buyer")}
						className={`rounded-[10px] border-2 px-4 py-3 text-sm font-semibold duration-150 ${
							role === "buyer"
								? "border-primary bg-primary-100 text-primary"
								: "border-neutral-200 text-neutral-400"
						}`}
					>
						Buyer
					</button>
				</div>
			</div>

			<div className="flex flex-col gap-1.5">
				<label htmlFor="name" className="text-sm font-medium text-neutral-500">
					Full name
				</label>
				<input
					id="name"
					name="name"
					type="text"
					required
					placeholder="Ada Okafor"
					className="input-class"
				/>
			</div>

			<div className="flex flex-col gap-1.5">
				<label htmlFor="email" className="text-sm font-medium text-neutral-500">
					Email
				</label>
				<input
					id="email"
					name="email"
					type="email"
					required
					placeholder="you@example.com"
					className="input-class"
				/>
			</div>

			<div className="flex flex-col gap-1.5">
				<label htmlFor="password" className="text-sm font-medium text-neutral-500">
					Password
				</label>
				<input
					id="password"
					name="password"
					type="password"
					required
					minLength={6}
					placeholder="At least 6 characters"
					className="input-class"
				/>
			</div>

			{state.error && <p className="text-sm text-red-600">{state.error}</p>}

			<Button variant="primary" className="w-full" disabled={pending}>
				{pending ? "Creating account…" : "Create Account"}
			</Button>
		</form>
	);
}
