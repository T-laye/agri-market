import { z } from "zod";

export const bankDetailsSchema = z.object({
	bankCode: z.string().trim().min(1, "Select your bank"),
	accountNumber: z.string().trim().regex(/^\d{10}$/, "Account number must be 10 digits"),
});
