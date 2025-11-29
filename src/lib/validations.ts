import { z } from "zod";

export const eventSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  bookTitle: z.string().min(1, "Book title is required").max(200),
  bookAuthor: z.string().max(100).optional(),
  location: z.string().min(1, "Location is required").max(500),
  date: z.string().min(1, "Date is required"),
  totalSpots: z.number().int().min(1, "Must have at least 1 spot").max(1000),
  waitlistEnabled: z.boolean().default(true),
  waitlistLimit: z.number().int().min(1).max(1000).optional().nullable(),
  description: z.string().max(2000).optional(),
});

export const registrationSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .trim(),
  instagramHandle: z
    .string()
    .min(1, "Instagram handle is required")
    .max(30, "Instagram handle must be less than 30 characters")
    .trim()
    .transform((val) => val.replace(/^@/, "")), // Remove @ if provided
});

export type EventInput = z.infer<typeof eventSchema>;
export type RegistrationInput = z.infer<typeof registrationSchema>;
