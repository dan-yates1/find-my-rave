import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().optional(),
  startDate: z.string().min(1, { message: "Start date is required" }),
  endDate: z.string().min(1, { message: "End date is required" }),
  location: z.string().min(1, { message: "Location is required" }),
  latitude: z
    .string()
    .optional()
    .transform((value) => (value ? parseFloat(value) : undefined)),
  longitude: z
    .string()
    .optional()
    .transform((value) => (value ? parseFloat(value) : undefined)),
  link: z.string().url({ message: "Must be a valid URL" }),
  imageUrl: z.string().url({ message: "Must be a valid URL" }).optional(),
});
