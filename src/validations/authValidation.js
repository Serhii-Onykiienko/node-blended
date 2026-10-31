import { Segments, Joi } from 'celebrate';

export const registrationUserSchema = {
  [Segments.BODY]: Joi.object({
    name: Joi.string().trim().min(2).required(),
    email: Joi.string().email().trim().required(),
    password: Joi.string().min(8).max(16).trim().required(),
  }),
};

export const loginUserSchema = {
  [Segments.BODY]: Joi.object({
    email: Joi.string().email().trim().required(),
    password: Joi.string().min(8).max(16).trim().required(),
  }),
};

export const requestResetEmailSchema = {
  [Segments.BODY]: Joi.object({
    email: Joi.string().email().required().trim(),
  }),
};

export const resetPasswordSchema = {
  [Segments.BODY]: Joi.object({
    password: Joi.string().min(8).max(16).required().trim(),
    token: Joi.string().required(),
  }),
};
