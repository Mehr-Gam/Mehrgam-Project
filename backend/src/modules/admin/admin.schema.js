import { z } from 'zod';
import { isValidNationalCode } from '../../utils/nationalCode.js';

const roleSchema = z.enum(['admin', 'disabled', 'supervisor', 'volunteer']);
const volunteerStatusSchema = z.enum(['pending', 'approved', 'rejected']);

export const listUsersSchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: z.object({
    role: roleSchema.optional(),
    isActive: z
      .enum(['true', 'false'])
      .transform((value) => value === 'true')
      .optional(),
    search: z
      .string()
      .trim()
      .min(1, 'Search must not be empty')
      .max(100, 'Search must be at most 100 characters')
      .optional(),
    page: z
      .string()
      .regex(/^\d+$/, 'Page must be a number')
      .transform(Number)
      .refine((value) => value >= 1, 'Page must be at least 1')
      .optional(),
    limit: z
      .string()
      .regex(/^\d+$/, 'Limit must be a number')
      .transform(Number)
      .refine((value) => value >= 1 && value <= 100, 'Limit must be between 1 and 100')
      .optional()
  })
});

export const userIdSchema = z.object({
  body: z.object({}),
  params: z.object({
    userId: z
      .string()
      .regex(/^\d+$/, 'User id must be a number')
      .transform(Number)
  }),
  query: z.object({})
});

export const volIdSchema = z.object({
  body: z.object({}),
  params: z.object({
    volId: z
      .string()
      .regex(/^\d+$/, 'Volunteer id must be a number')
      .transform(Number)
  }),
  query: z.object({})
});

export const listVolunteersSchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: z.object({
    status: volunteerStatusSchema.optional(),
    search: z
      .string()
      .trim()
      .min(1, 'Search must not be empty')
      .max(100, 'Search must be at most 100 characters')
      .optional(),
    page: z
      .string()
      .regex(/^\d+$/, 'Page must be a number')
      .transform(Number)
      .refine((value) => value >= 1, 'Page must be at least 1')
      .optional(),
    limit: z
      .string()
      .regex(/^\d+$/, 'Limit must be a number')
      .transform(Number)
      .refine((value) => value >= 1 && value <= 100, 'Limit must be between 1 and 100')
      .optional()
  })
});

export const createAdminSchema = z.object({
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
        .min(6, 'Confirm password must be at least 6 characters')
    })
    .superRefine((data, ctx) => {
      if (data.password !== data.confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['confirmPassword'],
          message: 'Passwords do not match'
        });
      }
    }),
  params: z.object({}),
  query: z.object({})
});


export const listProfilesSchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: z.object({
    isActive: z
      .enum(['true', 'false'])
      .transform((value) => value === 'true')
      .optional(),
    search: z
      .string()
      .trim()
      .min(1, 'Search must not be empty')
      .max(100, 'Search must be at most 100 characters')
      .optional(),
    page: z
      .string()
      .regex(/^\d+$/, 'Page must be a number')
      .transform(Number)
      .refine((value) => value >= 1, 'Page must be at least 1')
      .optional(),
    limit: z
      .string()
      .regex(/^\d+$/, 'Limit must be a number')
      .transform(Number)
      .refine((value) => value >= 1 && value <= 100, 'Limit must be between 1 and 100')
      .optional()
  })
});
