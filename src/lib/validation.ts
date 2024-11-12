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
  image: z.any().optional(),
  imageUrl: z.string().optional(),
  price: z.number().min(0, "Price must be 0 or greater"),
  eventType: z.string().min(1, "Event type is required"),
});

export type CreateEventFormData = z.infer<typeof createEventSchema>;

// Event type options
export const EVENT_TYPES = [
  'techno',
  'house',
  'drum & bass',
  'trance',
  'garage',
  'disco',
  'other'
] as const;
