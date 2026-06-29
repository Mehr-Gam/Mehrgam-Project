import { z } from 'zod';

const latitudeSchema = z
  .number()
  .min(-90, 'Latitude must be between -90 and 90')
  .max(90, 'Latitude must be between -90 and 90');

const longitudeSchema = z
  .number()
  .min(-180, 'Longitude must be between -180 and 180')
  .max(180, 'Longitude must be between -180 and 180');

const pointSchema = z.object({
  lat: latitudeSchema,
  lng: longitudeSchema
});

export const distanceEstimateSchema = z.object({
  body: z.object({
    origin: pointSchema,
    destination: pointSchema,
    type: z.enum(['car']).optional().default('car')
  }),
  params: z.object({}),
  query: z.object({})
});
