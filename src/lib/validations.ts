import { z } from "zod";
import { VALIDATION_LIMITS, EVENT_LIMITS } from "./constants";

export const eventSchema = z.object({
  title: z.string().min(1, "Title is required").max(EVENT_LIMITS.MAX_TITLE_LENGTH),
  bookTitle: z.string().min(1, "Book title is required").max(EVENT_LIMITS.MAX_TITLE_LENGTH),
  bookAuthor: z.string().max(100).optional(),
  location: z.string().min(1, "Location is required").max(500),
  date: z.string().min(1, "Date is required"),
  totalSpots: z.number().int().min(1, "Must have at least 1 spot").max(EVENT_LIMITS.MAX_SPOTS),
  description: z.string().max(EVENT_LIMITS.MAX_DESCRIPTION_LENGTH).optional(),
});

// Max base64 size (~5MB file = ~7MB base64)
const MAX_BASE64_SIZE = 7 * 1024 * 1024;

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
    .max(30, "Instagram handle must be 30 characters or less")
    .trim()
    .transform((val) => val.replace(/^@/, ""))
    .refine(
      (val) => !val || /^[a-zA-Z0-9._]*$/.test(val),
      "Instagram handle can only contain letters, numbers, dots, and underscores"
    )
    .optional()
    .or(z.literal("")),
  receiptUrl: z
    .string()
    .max(MAX_BASE64_SIZE, "Receipt file is too large")
    .refine(
      (val) => !val || val.startsWith('data:image/') || val.startsWith('data:application/pdf'),
      "Invalid receipt format - must be an image or PDF"
    )
    .optional()
    .nullable(),
});

export type EventInput = z.infer<typeof eventSchema>;
export type RegistrationInput = z.infer<typeof registrationSchema>;
