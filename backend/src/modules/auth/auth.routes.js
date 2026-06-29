//When a request came, which middlewares and controllers must run

import express from 'express';
import rateLimit from 'express-rate-limit';

import * as authController from './auth.controller.js';
import { loginSchema, registerSchema } from './auth.schema.js';

import { validate } from '../../middlewares/validate.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { authenticate } from '../../middlewares/authenticate.js';

const router = express.Router();

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REGISTER_ATTEMPTS',
      message: 'Too many register attempts'
    }
  }
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_LOGIN_ATTEMPTS',
      message: 'Too many login attempts'
    }
  }
});

router.post(
  '/register',
  registerLimiter,
  validate(registerSchema),
  asyncHandler(authController.register)
);

router.post(
  '/login',
  loginLimiter,
  validate(loginSchema),
  asyncHandler(authController.login)
);

router.post(
  '/refresh',
  asyncHandler(authController.refresh)
);

router.post(
  '/logout',
  asyncHandler(authController.logout)
);

router.get(
  '/me',
  authenticate,
  asyncHandler(authController.me)
);

export default router; 
