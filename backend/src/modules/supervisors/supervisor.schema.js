import { z } from 'zod';
import { isValidNationalCode } from '../../utils/nationalCode.js';

export const listMyDisabledSchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: z.object({
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

export const attachDisabledSchema = z.object({
  body: z.object({
    nationalCode: z
      .string()
      .trim()
      .regex(/^\d{10}$/, 'National code must be 10 digits')
      .refine(isValidNationalCode, 'National code is invalid')
  }),
  params: z.object({}),
  query: z.object({})
});

export const disabledIdSchema = z.object({
  body: z.object({}),
  params: z.object({
    disId: z
      .string()
      .regex(/^\d+$/, 'Disabled id must be a number')
      .transform(Number)
  }),
  query: z.object({})
});
