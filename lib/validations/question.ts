import { z } from 'zod';

export const questionSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(200),
  description: z.string().min(20, 'Please provide more details').max(5000),
  category: z.enum(['academic', 'hostel', 'campus', 'technical', 'social', 'general', 'events', 'administration']),
  tags: z.array(z.string()).max(5, 'Max 5 tags allowed'),
});

export type QuestionSchema = z.infer<typeof questionSchema>;

export const answerSchema = z.object({
  content: z.string().min(10, 'Answer must be at least 10 characters').max(5000),
});

export type AnswerSchema = z.infer<typeof answerSchema>;
