import { z } from 'zod';

const requestTypes = ['medical', 'shopping', 'entertainment', 'administrative'];

const latitudeSchema = z
  .number()
  .min(-90, 'Latitude must be between -90 and 90')
  .max(90, 'Latitude must be between -90 and 90');

const longitudeSchema = z
  .number()
  .min(-180, 'Longitude must be between -180 and 180')
  .max(180, 'Longitude must be between -180 and 180');

const dateTimeSchema = z
  .string()
  .trim()
  .refine((value) => !Number.isNaN(new Date(value).getTime()), {
    message: 'Requested time must be a valid date time'
  });

export const createServiceRequestSchema = z.object({
  body: z
    .object({
      disId: z
        .number()
        .int('Disabled id must be an integer')
        .positive('Disabled id must be positive')
        .optional(),

      requestType: z.enum(requestTypes),

      requestedTime: dateTimeSchema,

      originAddress: z
        .string()
        .trim()
        .max(255, 'Origin address must be at most 255 characters')
        .optional(),

      originLat: latitudeSchema,
      originLng: longitudeSchema,

      destinationAddress: z
        .string()
        .trim()
        .max(255, 'Destination address must be at most 255 characters')
        .optional(),

      destinationLat: latitudeSchema.optional(),
      destinationLng: longitudeSchema.optional(),

      description: z
        .string()
        .trim()
        .max(1000, 'Description must be at most 1000 characters')
        .optional()
    })
    .superRefine((data, ctx) => {
      const hasOnlyOneDestinationLocation =
        (data.destinationLat !== undefined && data.destinationLng === undefined) ||
        (data.destinationLat === undefined && data.destinationLng !== undefined);

      if (hasOnlyOneDestinationLocation) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['destinationLat'],
          message: 'Both destinationLat and destinationLng must be provided together'
        });
      }
    }),

  params: z.object({}),
  query: z.object({})
});

export const requestIdSchema = z.object({
  body: z.object({}),
  params: z.object({
    requestId: z
      .string()
      .regex(/^\d+$/, 'Request id must be a number')
      .transform(Number)
  }),
  query: z.object({})
});
