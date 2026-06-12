import express from 'express';

import * as serviceRequestController from './serviceRequest.controller.js';
import { createServiceRequestSchema, requestIdSchema } from './serviceRequest.schema.js';

import { authenticate } from '../../middlewares/authenticate.js';
import { authorize, requireApprovedVolunteer } from '../../middlewares/authorize.js';
import { validate } from '../../middlewares/validate.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = express.Router();

router.use(authenticate);

router.post(
  '/',
  authorize('disabled', 'supervisor'),
  validate(createServiceRequestSchema),
  asyncHandler(serviceRequestController.create)
);

router.get(
  '/my',
  authorize('disabled', 'supervisor'),
  asyncHandler(serviceRequestController.getMyRequests)
);

router.get(
  '/available',
  requireApprovedVolunteer,
  asyncHandler(serviceRequestController.getAvailableRequests)
);

router.post(
  '/:requestId/accept',
  requireApprovedVolunteer,
  validate(requestIdSchema),
  asyncHandler(serviceRequestController.accept)
);

router.patch(
  '/:requestId/finish',
  requireApprovedVolunteer,
  validate(requestIdSchema),
  asyncHandler(serviceRequestController.finish)
);

router.patch(
  '/:requestId/cancel',
  validate(requestIdSchema),
  asyncHandler(serviceRequestController.cancel)
);

export default router;
