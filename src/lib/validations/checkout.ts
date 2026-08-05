import { z } from "zod";

export const checkoutSchema = z.object({
	deliveryState: z.string().trim().min(1, "Select a delivery state"),
	deliveryCity: z.string().trim().max(80, "City is too long").optional(),
	deliveryAddress: z
		.string()
		.trim()
		.min(5, "Enter a more specific delivery address")
		.max(200, "Address is too long"),
	deliveryLandmark: z.string().trim().max(120, "Landmark is too long").optional(),
});
