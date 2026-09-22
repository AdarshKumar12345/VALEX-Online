import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters."),
    email: z.string().trim().email("Please enter a valid email address."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address."),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
      .regex(/\d/, "Password must contain at least one number."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const createListingSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, "Title must be at least 5 characters.")
    .max(100, "Title cannot exceed 100 characters."),
  description: z
    .string()
    .trim()
    .min(20, "Description must be at least 20 characters.")
    .max(2000, "Description cannot exceed 2000 characters."),
  price: z.coerce.number().positive("Price must be greater than 0."),
  category: z.string().min(1, "Please select a category."),
  condition: z.string().min(1, "Please select a condition."),
  location: z.string().trim().min(2, "Location is required."),
});

export const profileUpdateSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  phone: z.string().trim().optional(),
  location: z.string().trim().optional(),
  avatar: z.string().url("Avatar must be a valid URL.").or(z.literal("")).optional(),
});

export const createOfferSchema = z.object({
  amount: z.coerce.number().positive("Offer amount must be greater than 0."),
  message: z.string().trim().max(500, "Message cannot exceed 500 characters.").optional(),
});

export const createReportSchema = z.object({
  reason: z.string().min(1, "Please select a reason."),
  details: z
    .string()
    .trim()
    .min(10, "Please provide more details (at least 10 characters).")
    .max(1000, "Details cannot exceed 1000 characters."),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateListingInput = z.infer<typeof createListingSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type CreateOfferInput = z.infer<typeof createOfferSchema>;
export type CreateReportInput = z.infer<typeof createReportSchema>;
