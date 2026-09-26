import { z } from 'zod';

export const complaintSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title must be under 100 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters').max(2000, 'Description too long'),
  category: z.enum(['electricity', 'water', 'hostel', 'classroom', 'internet', 'cleaning', 'security', 'other']),
  location: z.string().min(3, 'Please specify a location').max(200),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
});

export type ComplaintSchema = z.infer<typeof complaintSchema>;

export const commentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(500, 'Comment too long'),
});

export type CommentSchema = z.infer<typeof commentSchema>;

export const statusUpdateSchema = z.object({
  status: z.enum(['submitted', 'under_review', 'in_progress', 'resolved', 'closed']),
  admin_note: z.string().max(500).optional(),
});

export type StatusUpdateSchema = z.infer<typeof statusUpdateSchema>;
