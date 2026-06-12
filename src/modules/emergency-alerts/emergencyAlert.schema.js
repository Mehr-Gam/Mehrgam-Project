import { z } from 'zod';

const latitudeSchema = z
  .number()
  .min(-90, 'Latitude must be between -90 and 90')
  .max(90, 'Latitude must be between -90 and 90');

const longitudeSchema = z
  .number()
  .min(-180, 'Longitude must be between -180 and 180')
  .max(180, 'Longitude must be between -180 and 180');

export const createEmergencyAlertSchema = z.object({
  body: z.object({
    disId: z
      .number()
      .int('Disabled id must be an integer')
      .positive('Disabled id must be positive')
      .optional(),

    alertLat: latitudeSchema,
    alertLng: longitudeSchema,

    address: z
      .string()
      .trim()
      .max(255, 'Address must be at most 255 characters')
      .optional()
  }),

  params: z.object({}),
  query: z.object({})
});

export const alertIdSchema = z.object({
  body: z.object({}),
  params: z.object({
    alertId: z
      .string()
      .regex(/^\d+$/, 'Alert id must be a number')
      .transform(Number)
  }),
  query: z.object({})
});
