import { z } from 'zod';

export const addressSchema = z.object({
  label: z.string().trim().max(50).optional(),
  fullName: z
    .string()
    .trim()
    .min(2, 'Name is too short')
    .max(25, 'Name must be 25 characters or fewer')
    .regex(/^[A-Za-z ]+$/, 'Name can only contain letters and spaces'),
  phone: z
    .string()
    .trim()
    .regex(/^(?:\+?44\s?|0)(?:\d\s?){9,10}\d$/, 'Enter a UK phone number, e.g. 07700 900123'),
  addressLine1: z.string().trim().min(3, 'Address is too short').max(100, 'Address must be 100 characters or fewer'),
  addressLine2: z.string().trim().max(100, 'Address must be 100 characters or fewer').optional(),
  city: z.string().trim().min(2, 'Enter a valid city').max(100),
});
