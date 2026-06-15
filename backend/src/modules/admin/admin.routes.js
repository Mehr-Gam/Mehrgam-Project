import express from 'express';

import * as adminController from './admin.controller.js';
import {
  createAdminSchema,
  listProfilesSchema,
  listUsersSchema,
  listVolunteersSchema,
  userIdSchema,
  volIdSchema
} from './admin.schema.js';

import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { validate } from '../../middlewares/validate.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize('admin'));

router.get(
  '/users',
  validate(listUsersSchema),
  asyncHandler(adminController.listUsers)
);

router.get(
  '/users/:userId',
  validate(userIdSchema),
  asyncHandler(adminController.getUserDetails)
);

router.patch(
  '/users/:userId/deactivate',
  validate(userIdSchema),
  asyncHandler(adminController.deactivateUser)
);

router.patch(
  '/users/:userId/activate',
  validate(userIdSchema),
  asyncHandler(adminController.activateUser)
);

router.post(
  '/admins',
  validate(createAdminSchema),
  asyncHandler(adminController.createAdmin)
);

router.get(
  '/disabled',
  validate(listProfilesSchema),
  asyncHandler(adminController.listDisabledProfiles)
);

router.get(
  '/supervisors',
  validate(listProfilesSchema),
  asyncHandler(adminController.listSupervisorProfiles)
);

router.get(
  '/volunteers',
  validate(listVolunteersSchema),
  asyncHandler(adminController.listVolunteers)
);

router.get(
  '/volunteers/pending',
  validate(listVolunteersSchema),
  asyncHandler(adminController.listPendingVolunteers)
);

router.get(
  '/volunteers/:volId',
  validate(volIdSchema),
  asyncHandler(adminController.getVolunteerDetails)
);

router.patch(
  '/volunteers/:volId/approve',
  validate(volIdSchema),
  asyncHandler(adminController.approveVolunteer)
);

router.patch(
  '/volunteers/:volId/reject',
  validate(volIdSchema),
  asyncHandler(adminController.rejectVolunteer)
);

export default router;
