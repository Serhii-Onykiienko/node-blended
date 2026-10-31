import { celebrate } from 'celebrate';
import { Router } from 'express';
import {
  loginUserSchema,
  registrationUserSchema,
  requestResetEmailSchema,
  resetPasswordSchema,
} from '../validations/authValidation.js';
import {
  loginUser,
  logoutUser,
  refreshUser,
  registrationUser,
  requestResetEmail,
  resetPassword,
} from '../controllers/authController.js';

const router = Router();

router.post(
  '/auth/register',
  celebrate(registrationUserSchema),
  registrationUser,
);

router.post('/auth/login', celebrate(loginUserSchema), loginUser);

router.post('/auth/logout', logoutUser);
router.post('/auth/refresh', refreshUser);

router.post(
  '/auth/request-reset-email',
  celebrate(requestResetEmailSchema),
  requestResetEmail,
);

router.post(
  '/auth/reset-password',
  celebrate(resetPasswordSchema),
  resetPassword,
);

export default router;
