import { z } from "zod";
import { VALIDATION_LIMITS, EVENT_LIMITS } from "./constants";

export const eventSchema = z.object({
  title: z.string().min(1, "Title is required").max(EVENT_LIMITS.MAX_TITLE_LENGTH),
  bookTitle: z.string().min(1, "Book title is required").max(EVENT_LIMITS.MAX_TITLE_LENGTH),
  bookAuthor: z.string().max(100).optional(),
  location: z.string().min(1, "Location is required").max(500),
  date: z.string().min(1, "Date is required"),
  totalSpots: z.number().int().min(1, "Must have at least 1 spot").max(EVENT_LIMITS.MAX_SPOTS),
  waitlistEnabled: z.boolean().default(true),
  waitlistLimit: z.number().int().min(1).max(EVENT_LIMITS.MAX_WAITLIST).optional().nullable(),
  description: z.string().max(EVENT_LIMITS.MAX_DESCRIPTION_LENGTH).optional(),
});

export const registrationSchema = z.object({
  name: z
    .string()
    .min(VALIDATION_LIMITS.NAME_MIN, "Name is required")
    .max(VALIDATION_LIMITS.NAME_MAX, `Name must be less than ${VALIDATION_LIMITS.NAME_MAX} characters`)
    .trim(),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .max(VALIDATION_LIMITS.EMAIL_MAX),
  instagramHandle: z
    .string()
    .max(VALIDATION_LIMITS.INSTAGRAM_MAX, `Instagram handle must be less than ${VALIDATION_LIMITS.INSTAGRAM_MAX} characters`)
    .trim()
    .transform((val) => val.replace(/^@/, ""))
    .optional()
    .or(z.literal("")), // Allow empty string
});

export type EventInput = z.infer<typeof eventSchema>;
export type RegistrationInput = z.infer<typeof registrationSchema>;
