import { z } from 'zod';

export const lostFoundSchema = z.object({
  type: z.enum(['lost', 'found']),
  item_name: z.string().min(2, 'Item name too short').max(100),
  description: z.string().min(10, 'Please provide more details').max(1000),
  category: z.enum(['electronics', 'documents', 'clothing', 'accessories', 'books', 'keys', 'wallet', 'phone', 'other']),
  location: z.string().min(3, 'Please specify a location').max(200),
  date_lost_found: z.string().min(1, 'Date is required'),
  contact_info: z.string().min(5, 'Please provide contact information').max(200),
});

export type LostFoundSchema = z.infer<typeof lostFoundSchema>;
