import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name is too short')
    .max(25, 'Name must be 25 characters or fewer')
    .regex(/^[A-Za-z ]+$/, 'Name can only contain letters and spaces'),
  email: z.string().email('Enter a valid email'),
  phone: z
    .string()
    .trim()
    .regex(/^(?:\+?44\s?|0)(?:\d\s?){9,10}\d$/, 'Enter a UK phone number, e.g. 07700 900123'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// Used only when registering from checkout — collects a delivery address up front so it can
// be saved as the account's default, skipping a redundant "add an address" step right after.
export const checkoutRegisterSchema = registerSchema
  .extend({
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    addressLine1: z.string().trim().min(3, 'Address is too short').max(100, 'Address must be 100 characters or fewer'),
    city: z.string().trim().min(2, 'Enter a valid city').max(100),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
