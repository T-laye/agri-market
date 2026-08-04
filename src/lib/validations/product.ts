import { z } from "zod";

export const productCategoryValues = [
	"Vegetables",
	"Fruits",
	"Tubers & Roots",
	"Grains & Legumes",
] as const;

export const productSchema = z.object({
	name: z
		.string()
		.trim()
		.min(2, "Product name must be at least 2 characters")
		.max(100, "Product name is too long"),
	category: z.enum(productCategoryValues, "Select a category"),
	price: z.coerce.number().positive("Price must be greater than 0"),
	unit: z
		.string()
		.trim()
		.min(1, "e.g. per basket, per kg, per bag")
		.max(40, "Unit is too long"),
	quantity: z.coerce
		.number()
		.int("Quantity must be a whole number")
		.min(0, "Quantity can't be negative"),
	description: z
		.string()
		.trim()
		.min(10, "Description must be at least 10 characters")
		.max(1000, "Description is too long"),
	location: z.string().trim().min(1, "Select your state"),
	address: z
		.string()
		.trim()
		.min(5, "Enter a more specific address")
		.max(200, "Address is too long"),
	images: z
		.array(z.string())
		.min(1, "Upload at least one product photo")
		.max(5, "Up to 5 photos"),
});
