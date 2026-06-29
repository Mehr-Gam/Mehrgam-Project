import { z } from 'zod';
import { isValidNationalCode } from '../../utils/nationalCode.js';

export const loginSchema = z.object({
  body: z.object({
    nationalCode: z
      .string()
      .trim()
      .regex(/^\d{10}$/, 'National code must be 10 digits')
      .refine(isValidNationalCode, 'National code is invalid'),

    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
  }),

  params: z.object({}),
  query: z.object({})
});

export const registerSchema = z.object({
  body: z
    .object({
      nationalCode: z
        .string()
        .trim()
        .regex(/^\d{10}$/, 'National code must be 10 digits')
        .refine(isValidNationalCode, 'National code is invalid'),

      firstName: z
        .string()
        .trim()
        .min(2, 'First name must be at least 2 characters')
        .max(50, 'First name must be at most 50 characters'),

      lastName: z
        .string()
        .trim()
        .min(2, 'Last name must be at least 2 characters')
        .max(50, 'Last name must be at most 50 characters'),

      phone: z
        .string()
        .trim()
        .regex(/^09[0-9]{9}$/, 'Phone number must be valid'),

      birthDate: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, 'Birth date must be Gregorian YYYY-MM-DD')
        .optional(),

      province: z
        .string()
        .trim()
        .max(50, 'Province must be at most 50 characters')
        .optional(),

      city: z
        .string()
        .trim()
        .max(50, 'City must be at most 50 characters')
        .optional(),

      password: z
        .string()
        .min(6, 'Password must be at least 6 characters'),

      confirmPassword: z
        .string()
        .min(6, 'Confirm password must be at least 6 characters'),

      role: z.enum(['disabled', 'supervisor', 'volunteer']),

      homeAddress: z
        .string()
        .trim()
        .min(3, 'Home address must be at least 3 characters')
        .optional(),

      accessibilityNeed: z
        .string()
        .trim()
        .optional()
    })
    .superRefine((data, ctx) => {
      if (data.password !== data.confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['confirmPassword'],
          message: 'Passwords do not match'
        });
      }

      if (data.role === 'disabled' || data.role === 'volunteer') {
        if (!data.homeAddress) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['homeAddress'],
            message: 'Home address is required for this role'
          });
        }
      }
    }),

  params: z.object({}),
  query: z.object({})
});
