import express from 'express';

import * as mapController from './map.controller.js';
import { reverseGeocodeSchema, routePreviewSchema, searchPlacesSchema } from './map.schema.js';

import { authenticate } from '../../middlewares/authenticate.js';
import { validate } from '../../middlewares/validate.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const router = express.Router();

router.use(authenticate);

router.get('/reverse', validate(reverseGeocodeSchema), asyncHandler(mapController.reverse));
router.get('/search', validate(searchPlacesSchema), asyncHandler(mapController.search));
router.post('/route', validate(routePreviewSchema), asyncHandler(mapController.route));

export default router;
