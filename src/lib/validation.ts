import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  location: z.string().min(1, "Location is required"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  link: z.string().url({ message: "Must be a valid URL" }),
  image: z.any().optional(), // Expect a file here
  imageUrl: z.string().optional(),
});

export type CreateEventFormData = z.infer<typeof createEventSchema>;
