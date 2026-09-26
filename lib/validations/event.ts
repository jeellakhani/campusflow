import { z } from 'zod';

export const eventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  description: z.string().min(20, 'Description must be at least 20 characters').max(3000),
  category: z.enum(['academic', 'cultural', 'sports', 'technical', 'social', 'workshop', 'seminar', 'other']),
  location: z.string().min(3, 'Please specify a location').max(200),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().optional(),
  max_participants: z.coerce.number().int().positive().optional().or(z.literal('')),
  registration_deadline: z.string().optional(),
});

export type EventSchema = z.infer<typeof eventSchema>;
