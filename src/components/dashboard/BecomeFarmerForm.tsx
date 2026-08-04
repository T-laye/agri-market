"use client";

import { useActionState } from "react";
import { becomeFarmer } from "@/app/dashboard/farmer-actions";
import type { FarmerActionState } from "@/app/dashboard/farmer-actions";
import { locations } from "@/lib/data/products";
import Button from "@/components/ui/Button";

const initialState: FarmerActionState = { error: null };

export default function BecomeFarmerForm({ initialPhone }: { initialPhone: string }) {
	const [state, formAction, pending] = useActionState(becomeFarmer, initialState);

	return (
		<form action={formAction} className="flex flex-col gap-5">
			<div className="flex flex-col gap-1.5">
				<label htmlFor="farmName" className="text-sm font-medium text-neutral-500">
					Farm or business name
				</label>
				<input
					id="farmName"
					name="farmName"
					type="text"
					placeholder="Adebayo Farms"
					className="input-class"
				/>
				{state.fieldErrors?.farmName && (
					<span className="text-xs text-red-600">{state.fieldErrors.farmName}</span>
				)}
			</div>

			<div className="flex flex-col gap-1.5">
				<label htmlFor="state" className="text-sm font-medium text-neutral-500">
					State
				</label>
				<select id="state" name="state" defaultValue="" className="select-class">
					<option value="" disabled>
						Select your state
					</option>
					{locations.map((loc) => (
						<option key={loc} value={loc}>
							{loc} State
						</option>
					))}
				</select>
				{state.fieldErrors?.state && (
					<span className="text-xs text-red-600">{state.fieldErrors.state}</span>
				)}
			</div>

			<div className="flex flex-col gap-1.5">
				<label htmlFor="phone" className="text-sm font-medium text-neutral-500">
					Phone number
				</label>
				<input
					id="phone"
					name="phone"
					type="tel"
					defaultValue={initialPhone}
					placeholder="080XXXXXXXX"
					className="input-class"
				/>
				{state.fieldErrors?.phone && (
					<span className="text-xs text-red-600">{state.fieldErrors.phone}</span>
				)}
			</div>

			{state.error && !state.fieldErrors && (
				<p className="text-sm text-red-600">{state.error}</p>
			)}

			<Button variant="primary" className="w-fit" disabled={pending}>
				{pending ? "Setting up…" : "Start Selling on AgriMarket"}
			</Button>
		</form>
	);
}
