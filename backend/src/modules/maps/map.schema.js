import { z } from 'zod';

const latitudeSchema = z
  .number()
  .min(-90, 'Latitude must be between -90 and 90')
  .max(90, 'Latitude must be between -90 and 90');

const longitudeSchema = z
  .number()
  .min(-180, 'Longitude must be between -180 and 180')
  .max(180, 'Longitude must be between -180 and 180');

const queryLatitudeSchema = z.coerce
  .number()
  .min(-90, 'Latitude must be between -90 and 90')
  .max(90, 'Latitude must be between -90 and 90');

const queryLongitudeSchema = z.coerce
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

export const searchPlacesSchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: z.object({
    term: z
      .string()
      .trim()
      .min(2, 'Search term must be at least 2 characters')
      .max(120, 'Search term must be at most 120 characters'),
    lat: queryLatitudeSchema,
    lng: queryLongitudeSchema
  })
});

export const reverseGeocodeSchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: z.object({
    lat: queryLatitudeSchema,
    lng: queryLongitudeSchema
  })
});
