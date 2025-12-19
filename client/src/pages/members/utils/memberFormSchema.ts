import { z } from 'zod';

const roles = z.enum([
  'superAdmin',
  'groupManager',
  'hotelManager',
  'staff',
  'brandManager',
  "revenueManager",
]);

// Export the base schema as a ZodObject without any refinements.
export const baseMemberFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required.').max(50, 'First name must be at most 50 characters.').trim(),
  lastName: z.string().min(1, 'Last name is required.').max(50, 'Last name must be at most 50 characters.').trim(),
  email: z.string().min(1, 'Email is required.').email('Please enter a valid email address.').trim().toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  confirmPassword: z.string().min(1, 'Confirm password is required.'),
  role: roles,
  level: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
});

// A separate, refined schema can be defined here, but we won't use it directly in the component.
const memberFormSchema = baseMemberFormSchema.refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ['confirmPassword'],
});

export default memberFormSchema;