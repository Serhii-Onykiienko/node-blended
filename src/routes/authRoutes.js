import { celebrate } from 'celebrate';
import { Router } from 'express';
import {
  loginUserSchema,
  registrationUserSchema,
} from '../validations/authValidation.js';
import {
  loginUser,
  logoutUser,
  registrationUser,
} from '../controllers/authController.js';

const router = Router();

router.post(
  '/auth/register',
  celebrate(registrationUserSchema),
  registrationUser,
);

router.post('/auth/login', celebrate(loginUserSchema), loginUser);

router.post('/auth/logout', logoutUser);

export default router;
