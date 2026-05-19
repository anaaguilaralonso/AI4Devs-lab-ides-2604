import { z } from 'zod';

const emptyToUndefined = (value: unknown): unknown => {
  if (value === '' || value === null || value === undefined) {
    return undefined;
  }
  return value;
};

export const createCandidateSchema = z.object({
  firstName: z
    .string({ required_error: 'First name is required' })
    .trim()
    .min(1, 'First name is required')
    .max(100, 'First name must not exceed 100 characters'),
  lastName: z
    .string({ required_error: 'Last name is required' })
    .trim()
    .min(1, 'Last name is required')
    .max(100, 'Last name must not exceed 100 characters'),
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Invalid email address')
    .max(255, 'Email must not exceed 255 characters'),
  phone: z.preprocess(
    emptyToUndefined,
    z.string().trim().max(30, 'Phone must not exceed 30 characters').optional(),
  ),
  address: z.preprocess(
    emptyToUndefined,
    z.string().trim().max(500, 'Address must not exceed 500 characters').optional(),
  ),
  education: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .trim()
      .max(5000, 'Education must not exceed 5000 characters')
      .optional(),
  ),
  experience: z.preprocess(
    emptyToUndefined,
    z
      .string()
      .trim()
      .max(5000, 'Work experience must not exceed 5000 characters')
      .optional(),
  ),
});

export type CreateCandidateInput = z.infer<typeof createCandidateSchema>;

export function formatZodErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = issue.path[0]?.toString() ?? 'form';
    if (!errors[field]) {
      errors[field] = issue.message;
    }
  }
  return errors;
}
