import { z } from 'zod';

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

export const updateLocationSchema = z.object({
  body: z.object({
    currentLat: z
      .number()
      .min(-90, 'Latitude must be between -90 and 90')
      .max(90, 'Latitude must be between -90 and 90'),

    currentLng: z
      .number()
      .min(-180, 'Longitude must be between -180 and 180')
      .max(180, 'Longitude must be between -180 and 180')
  }),

  params: z.object({}),
  query: z.object({})
});

export const createAvailabilitySchema = z.object({
  body: z
    .object({
      weekday: z
        .number()
        .int('Weekday must be an integer')
        .min(0, 'Weekday must be between 0 and 6')
        .max(6, 'Weekday must be between 0 and 6'),

      startTime: z
        .string()
        .regex(timeRegex, 'Start time must be HH:MM'),

      endTime: z
        .string()
        .regex(timeRegex, 'End time must be HH:MM')
    })
    .superRefine((data, ctx) => {
      if (data.startTime >= data.endTime) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['endTime'],
          message: 'End time must be after start time'
        });
      }
    }),

  params: z.object({}),
  query: z.object({})
});

export const availabilityIdSchema = z.object({
  body: z.object({}),

  params: z.object({
    availId: z
      .string()
      .regex(/^\d+$/, 'Availability id must be a number')
      .transform(Number)
  }),

  query: z.object({})
});
