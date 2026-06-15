import { z } from 'zod';

const latitudeSchema = z
  .coerce
  .number()
  .min(-90, 'Latitude must be between -90 and 90')
  .max(90, 'Latitude must be between -90 and 90');

const longitudeSchema = z
  .coerce
  .number()
  .min(-180, 'Longitude must be between -180 and 180')
  .max(180, 'Longitude must be between -180 and 180');

export const reverseGeocodeSchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: z.object({
    lat: latitudeSchema,
    lng: longitudeSchema
  })
});

export const searchPlacesSchema = z.object({
  body: z.object({}),
  params: z.object({}),
  query: z.object({
    term: z
      .string()
      .trim()
      .min(2, 'Search term must be at least 2 characters')
      .max(100, 'Search term must be at most 100 characters'),
    lat: latitudeSchema,
    lng: longitudeSchema
  })
});

export const routePreviewSchema = z.object({
  body: z.object({
    originLat: latitudeSchema,
    originLng: longitudeSchema,
    destinationLat: latitudeSchema,
    destinationLng: longitudeSchema,
    type: z.enum(['car', 'motorcycle']).default('car')
  }),
  params: z.object({}),
  query: z.object({})
});
