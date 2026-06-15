import express from 'express';

import * as supervisorController from './supervisor.controller.js';
import {
  attachDisabledSchema,
  disabledIdSchema,
  listMyDisabledSchema
} from './supervisor.schema.js';

import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { validate } from '../../middlewares/validate.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize('supervisor'));

router.get(
  '/me/disabled',
  validate(listMyDisabledSchema),
  asyncHandler(supervisorController.getMyDisabled)
);

router.post(
  '/me/disabled',
  validate(attachDisabledSchema),
  asyncHandler(supervisorController.attachDisabled)
);

router.delete(
  '/me/disabled/:disId',
  validate(disabledIdSchema),
  asyncHandler(supervisorController.removeDisabled)
);

export default router;
