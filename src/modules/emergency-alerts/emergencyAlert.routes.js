import express from 'express';

import * as emergencyAlertController from './emergencyAlert.controller.js';
import { alertIdSchema, createEmergencyAlertSchema } from './emergencyAlert.schema.js';

import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { validate } from '../../middlewares/validate.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize('disabled', 'supervisor'));

router.post(
  '/',
  validate(createEmergencyAlertSchema),
  asyncHandler(emergencyAlertController.create)
);

router.get(
  '/my',
  asyncHandler(emergencyAlertController.getMyAlerts)
);

router.patch(
  '/:alertId/resolve',
  validate(alertIdSchema),
  asyncHandler(emergencyAlertController.resolve)
);

router.patch(
  '/:alertId/cancel',
  validate(alertIdSchema),
  asyncHandler(emergencyAlertController.cancel)
);

export default router;
