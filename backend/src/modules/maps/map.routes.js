import express from 'express';

import * as mapController from './map.controller.js';
import { distanceEstimateSchema, reverseGeocodeSchema, searchPlacesSchema } from './map.schema.js';

import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { validate } from '../../middlewares/validate.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = express.Router();

router.use(authenticate);

router.get(
  '/search',
  validate(searchPlacesSchema),
  asyncHandler(mapController.searchPlaces)
);

router.get(
  '/reverse',
  validate(reverseGeocodeSchema),
  asyncHandler(mapController.reverseGeocode)
);

router.post(
  '/distance-estimate',
  authorize('disabled', 'supervisor', 'volunteer'),
  validate(distanceEstimateSchema),
  asyncHandler(mapController.estimateDistance)
);

export default router;
