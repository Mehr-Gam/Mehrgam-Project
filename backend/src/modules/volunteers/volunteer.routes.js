import express from 'express';

import * as volunteerController from './volunteer.controller.js';
import {
  availabilityIdSchema,
  createAvailabilitySchema,
  updateLocationSchema
} from './volunteer.schema.js';

import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { validate } from '../../middlewares/validate.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize('volunteer'));

router.get(
  '/me',
  asyncHandler(volunteerController.getMe)
);

router.patch(
  '/me/location',
  validate(updateLocationSchema),
  asyncHandler(volunteerController.updateLocation)
);

router.patch(
  '/me/online',
  asyncHandler(volunteerController.goOnline)
);

router.patch(
  '/me/offline',
  asyncHandler(volunteerController.goOffline)
);

router.post(
  '/me/availability',
  validate(createAvailabilitySchema),
  asyncHandler(volunteerController.createAvailability)
);

router.get(
  '/me/availability',
  asyncHandler(volunteerController.getAvailability)
);

router.patch(
  '/me/availability/:availId/activate',
  validate(availabilityIdSchema),
  asyncHandler(volunteerController.activateAvailability)
);

router.patch(
  '/me/availability/:availId/deactivate',
  validate(availabilityIdSchema),
  asyncHandler(volunteerController.deactivateAvailability)
);

router.delete(
  '/me/availability/:availId',
  validate(availabilityIdSchema),
  asyncHandler(volunteerController.deleteAvailability)
);

export default router;
