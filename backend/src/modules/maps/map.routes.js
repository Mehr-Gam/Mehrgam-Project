import express from 'express';

import * as mapController from './map.controller.js';
import { distanceEstimateSchema } from './map.schema.js';

import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { validate } from '../../middlewares/validate.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = express.Router();

router.use(authenticate);

router.post(
  '/distance-estimate',
  authorize('disabled', 'supervisor'),
  validate(distanceEstimateSchema),
  asyncHandler(mapController.estimateDistance)
);

export default router;
