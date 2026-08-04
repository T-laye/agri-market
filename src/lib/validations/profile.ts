import { z } from "zod";

export const updateProfileSchema = z.object({
	name: z
		.string()
		.trim()
		.min(2, "Full name must be at least 2 characters")
		.max(80, "Full name is too long"),
	phone: z
		.string()
		.trim()
		.regex(/^\+?[0-9]{10,14}$/, "Enter a valid phone number")
		.or(z.literal(""))
		.optional(),
	avatarUrl: z.string().trim().url().or(z.literal("")).optional(),
	state: z.string().trim().max(60, "State is too long").or(z.literal("")).optional(),
	city: z.string().trim().max(80, "City is too long").or(z.literal("")).optional(),
	address: z.string().trim().max(200, "Address is too long").or(z.literal("")).optional(),
	landmark: z.string().trim().max(120, "Landmark is too long").or(z.literal("")).optional(),
});

export const changePasswordSchema = z
	.object({
		currentPassword: z.string().min(1, "Enter your current password"),
		newPassword: z
			.string()
			.min(6, "New password must be at least 6 characters")
			.max(72, "New password is too long"),
		confirmNewPassword: z.string().min(1, "Please confirm your new password"),
	})
	.refine((data) => data.newPassword === data.confirmNewPassword, {
		message: "Passwords do not match",
		path: ["confirmNewPassword"],
	});
