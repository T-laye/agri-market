import { z } from "zod";

export const becomeFarmerSchema = z.object({
	farmName: z
		.string()
		.trim()
		.min(2, "Farm or business name must be at least 2 characters")
		.max(100, "Farm name is too long"),
	state: z.string().trim().min(1, "Select your state"),
	phone: z.string().trim().regex(/^\+?[0-9]{10,14}$/, "Enter a valid phone number"),
});

export const kycSubmitSchema = z.object({
	idDocumentUrl: z.string().trim().min(1, "Upload a valid government-issued ID"),
	proofDocumentUrl: z
		.string()
		.trim()
		.min(1, "Upload proof of farm ownership or address"),
});
