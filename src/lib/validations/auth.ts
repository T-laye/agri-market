import { z } from "zod";

export const loginSchema = z.object({
	email: z.email("Enter a valid email address"),
	password: z.string().min(1, "Password is required"),
});

export const signupSchema = z.object({
	name: z
		.string()
		.trim()
		.min(2, "Full name must be at least 2 characters")
		.max(80, "Full name is too long"),
	email: z.email("Enter a valid email address"),
	password: z
		.string()
		.min(6, "Password must be at least 6 characters")
		.max(72, "Password is too long"),
	role: z.enum(["farmer", "buyer"], "Select whether you're a farmer or buyer"),
});

export const forgotPasswordSchema = z.object({
	email: z.email("Enter a valid email address"),
});

export const resetPasswordSchema = z
	.object({
		password: z
			.string()
			.min(6, "Password must be at least 6 characters")
			.max(72, "Password is too long"),
		confirmPassword: z.string().min(1, "Please confirm your password"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

export type FieldErrors = Record<string, string>;

export function flattenZodErrors(error: z.ZodError): FieldErrors {
	const fieldErrors: FieldErrors = {};
	for (const issue of error.issues) {
		const key = issue.path[0];
		if (typeof key === "string" && !fieldErrors[key]) {
			fieldErrors[key] = issue.message;
		}
	}
	return fieldErrors;
}
